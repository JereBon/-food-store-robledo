"""Tests for pedidos router"""
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlmodel import select

from app.core.database import get_session
from app.core.security import create_access_token, hash_password
from app.db.models import OrderState, Role, User, UserRole
from app.main import app
from app.modules.direcciones.model import DireccionEntrega
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

    product = Product(
        name="Pizza",
        description="Margarita",
        price=Decimal("500.00"),
        stock=10,
        disponible=True,
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    direccion = DireccionEntrega(
        usuario_id=user.id,
        calle="Av. Siempre Viva",
        numero="742",
        ciudad="Springfield",
        es_predeterminada=True,
    )
    session.add(direccion)
    session.commit()
    session.refresh(direccion)

    return {"user": user, "product": product, "direccion": direccion, "token": _token(user.id)}


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_create_pedido_success(client, setup_db):
    db = setup_db
    resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": db["direccion"].id, "items": [{"producto_id": db["product"].id, "cantidad": 2, "exclusiones": []}]},
        headers=_headers(db["token"]),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["estado_id"] == 1
    assert Decimal(data["total"]) == Decimal("1000.00")
    assert len(data["items"]) == 1


def test_create_pedido_missing_direccion(client, setup_db):
    db = setup_db
    resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": 9999, "items": [{"producto_id": db["product"].id, "cantidad": 1, "exclusiones": []}]},
        headers=_headers(db["token"]),
    )
    assert resp.status_code == 404


def test_create_pedido_insufficient_stock(client, setup_db, session):
    db = setup_db
    product = session.exec(select(Product).where(Product.id == db["product"].id)).first()
    product.stock = 0
    session.add(product)
    session.commit()

    resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": db["direccion"].id, "items": [{"producto_id": db["product"].id, "cantidad": 5, "exclusiones": []}]},
        headers=_headers(db["token"]),
    )
    assert resp.status_code == 422


def test_list_pedidos_empty(client, setup_db):
    db = setup_db
    resp = client.get("/api/v1/pedidos", headers=_headers(db["token"]))
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_pedido_own(client, setup_db):
    db = setup_db
    create_resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": db["direccion"].id, "items": [{"producto_id": db["product"].id, "cantidad": 1, "exclusiones": []}]},
        headers=_headers(db["token"]),
    )
    assert create_resp.status_code == 201
    pedido_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/pedidos/{pedido_id}", headers=_headers(db["token"]))
    assert resp.status_code == 200
    assert resp.json()["id"] == pedido_id


def test_get_pedido_other_user_forbidden(client, setup_db, session):
    db = setup_db
    user2 = User(email="other@test.com", password_hash=hash_password("pass"), nombre="Other", apellido="User")
    session.add(user2)
    session.commit()
    session.refresh(user2)
    token2 = _token(user2.id)

    create_resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": db["direccion"].id, "items": [{"producto_id": db["product"].id, "cantidad": 1, "exclusiones": []}]},
        headers=_headers(db["token"]),
    )
    pedido_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/pedidos/{pedido_id}", headers=_headers(token2))
    assert resp.status_code == 403


def test_create_pedido_unauthenticated(client, setup_db):
    db = setup_db
    resp = client.post(
        "/api/v1/pedidos",
        json={"direccion_id": db["direccion"].id, "items": [{"producto_id": db["product"].id, "cantidad": 1}]},
    )
    assert resp.status_code == 401
