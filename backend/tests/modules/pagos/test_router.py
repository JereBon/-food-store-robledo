"""Tests for pagos router"""
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_session
from app.core.security import create_access_token, hash_password
from app.db.models import OrderState, Role, User, UserRole
from app.main import app
from app.modules.direcciones.model import DireccionEntrega
from app.modules.pagos.model import FormaPago, Pago
from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.productos.model import Product


def _token(user_id: int) -> str:
    return create_access_token(subject=str(user_id), roles=[])


@pytest.fixture
def client(session, sqlite_engine):
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def setup_db(session):
    session.add(Role(id=4, code="CLIENT", name="Cliente"))
    session.add(OrderState(id=1, code="PENDIENTE", name="Pendiente", is_terminal=False))
    session.add(OrderState(id=2, code="CONFIRMADO", name="Confirmado", is_terminal=False))
    session.add(FormaPago(id=1, nombre="Tarjeta de crédito", activo=True))
    session.add(FormaPago(id=2, nombre="Tarjeta de débito", activo=True))
    session.commit()

    user = User(
        email="client@test.com",
        password_hash=hash_password("pass"),
        nombre="Test",
        apellido="User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    session.add(UserRole(user_id=user.id, role_id=4))

    product = Product(name="Pizza", description="Margarita", price=Decimal("500.00"), stock=10, disponible=True)
    session.add(product)
    session.commit()
    session.refresh(product)

    direccion = DireccionEntrega(
        usuario_id=user.id, calle="Calle Test", numero="1", ciudad="Ciudad", es_predeterminada=True
    )
    session.add(direccion)

    pedido = Pedido(
        usuario_id=user.id,
        estado_id=1,
        forma_pago_id=1,
        total=Decimal("500.00"),
        costo_envio=Decimal("0.00"),
        direccion_calle="Calle Test",
        direccion_ciudad="Ciudad",
    )
    session.add(pedido)
    session.commit()
    session.refresh(pedido)

    detalle = DetallePedido(
        pedido_id=pedido.id,
        producto_id=product.id,
        cantidad=1,
        precio_unitario=Decimal("500.00"),
        subtotal=Decimal("500.00"),
        exclusiones=[],
    )
    session.add(detalle)
    session.commit()

    return {"user": user, "pedido": pedido, "product": product, "token": _token(user.id)}


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_listar_formas_pago(client, setup_db):
    resp = client.get("/api/v1/pagos/formas-pago")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    nombres = [f["nombre"] for f in data]
    assert "Tarjeta de crédito" in nombres
    assert "Tarjeta de débito" in nombres


@patch("app.modules.pagos.service._get_sdk")
def test_crear_preferencia_success(mock_sdk, client, setup_db):
    sdk = MagicMock()
    sdk.preference.return_value.create.return_value = {
        "response": {"id": "pref-abc", "init_point": "https://mp.com/pay/pref-abc"}
    }
    mock_sdk.return_value = sdk

    db = setup_db
    resp = client.post(
        "/api/v1/pagos/crear-preferencia",
        json={"pedido_id": db["pedido"].id},
        headers=_headers(db["token"]),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["preference_id"] == "pref-abc"
    assert "init_point" in data


@patch("app.modules.pagos.service._get_sdk")
def test_crear_preferencia_wrong_order_returns_404(mock_sdk, client, setup_db):
    db = setup_db
    user2 = User(email="other@test.com", password_hash=hash_password("pass"), nombre="Other", apellido="User")
    setup_db["user"].id  # just to access
    from app.modules.pedidos.model import Pedido as P
    session_obj = None

    resp = client.post(
        "/api/v1/pagos/crear-preferencia",
        json={"pedido_id": 9999},
        headers=_headers(db["token"]),
    )
    assert resp.status_code in (404, 422)


@patch("app.modules.pagos.service._get_sdk")
def test_webhook_always_200(mock_sdk, client, setup_db):
    sdk = MagicMock()
    sdk.payment.return_value.get.return_value = {"response": {"status": "rejected", "external_reference": "1", "transaction_amount": 0}}
    mock_sdk.return_value = sdk

    resp = client.post("/api/v1/pagos/webhook", json={"type": "payment", "data": {"id": "mp-001"}})
    assert resp.status_code == 200


@patch("app.modules.pagos.service._get_sdk")
def test_webhook_invalid_body_still_200(mock_sdk, client, setup_db):
    resp = client.post("/api/v1/pagos/webhook", json={})
    assert resp.status_code == 200


def test_listar_pagos_pedido_own(client, setup_db, session):
    db = setup_db
    session.add(Pago(
        pedido_id=db["pedido"].id,
        monto=Decimal("500.00"),
        mp_payment_id="pay-001",
        mp_status="approved",
        external_reference=str(db["pedido"].id),
        idempotency_key=f"{db['pedido'].id}-pay-001",
    ))
    session.commit()

    resp = client.get(f"/api/v1/pagos/pedido/{db['pedido'].id}", headers=_headers(db["token"]))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["mp_status"] == "approved"


def test_listar_pagos_pedido_other_user_forbidden(client, setup_db, session):
    db = setup_db
    user2 = User(email="other2@test.com", password_hash=hash_password("pass"), nombre="Other", apellido="U")
    session.add(user2)
    session.commit()
    session.refresh(user2)

    resp = client.get(f"/api/v1/pagos/pedido/{db['pedido'].id}", headers=_headers(_token(user2.id)))
    assert resp.status_code == 403
