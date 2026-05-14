"""Tests for PedidoService"""
from decimal import Decimal
from unittest.mock import MagicMock

import pytest

from app.modules.pedidos.schemas import ItemCreate, PedidoCreate
from app.modules.pedidos.service import InsufficientStockError, PedidoService


def _make_service(*, stock=10, price=Decimal("100.00"), has_address=True, has_forma_pago=True):
    pedido_repo = MagicMock()
    direccion_repo = MagicMock()
    producto_repo = MagicMock()
    forma_pago_repo = MagicMock()

    address = MagicMock()
    address.id = 1
    address.calle = "Calle Falsa"
    address.numero = "123"
    address.piso = None
    address.ciudad = "Springfield"
    address.codigo_postal = "1234"
    direccion_repo.get_by_id_and_user.return_value = address if has_address else None

    forma_pago = MagicMock()
    forma_pago.id = 1
    forma_pago.activo = True
    forma_pago_repo.get_by_id.return_value = forma_pago if has_forma_pago else None

    product = MagicMock()
    product.id = 1
    product.price = price
    product.deleted_at = None
    producto_repo.get_by_id.return_value = product

    pedido_repo.get_stock_for_update.return_value = stock
    pedido_repo.create_pedido.side_effect = lambda p: (setattr(p, "id", 1) or p)
    pedido_repo.create_detalle.return_value = MagicMock()
    pedido_repo.create_historial.return_value = MagicMock()

    return PedidoService(pedido_repo, direccion_repo, producto_repo, forma_pago_repo)


def _make_payload(**kwargs):
    defaults = {"direccion_id": 1, "forma_pago_id": 1, "items": [ItemCreate(producto_id=1, cantidad=1)]}
    defaults.update(kwargs)
    return PedidoCreate(**defaults)


def test_create_order_success():
    service = _make_service(stock=5, price=Decimal("250.00"))
    data = _make_payload(items=[ItemCreate(producto_id=1, cantidad=2, exclusiones=[])])
    pedido = service.create_order(usuario_id=1, data=data)
    assert pedido.total == Decimal("500.00")
    assert pedido.estado_id == 1
    assert pedido.costo_envio == Decimal("0.00")
    assert pedido.forma_pago_id == 1


def test_create_order_does_not_decrement_stock():
    service = _make_service(stock=10)
    data = _make_payload(items=[ItemCreate(producto_id=1, cantidad=3)])
    service.create_order(usuario_id=1, data=data)
    # stock should NOT be decremented at order creation
    service.producto_repo.session.add.assert_not_called()


def test_create_order_insufficient_stock_raises():
    service = _make_service(stock=1)
    data = _make_payload(items=[ItemCreate(producto_id=1, cantidad=3)])
    with pytest.raises(InsufficientStockError) as exc_info:
        service.create_order(usuario_id=1, data=data)
    assert exc_info.value.producto_id == 1
    assert exc_info.value.available == 1
    assert exc_info.value.requested == 3


def test_create_order_missing_address_raises():
    service = _make_service(has_address=False)
    data = _make_payload(direccion_id=99)
    with pytest.raises(ValueError, match="Dirección"):
        service.create_order(usuario_id=1, data=data)


def test_create_order_invalid_forma_pago_raises():
    service = _make_service(has_forma_pago=False)
    data = _make_payload(forma_pago_id=99)
    with pytest.raises(ValueError, match="Forma de pago"):
        service.create_order(usuario_id=1, data=data)


def test_create_order_stores_price_snapshot():
    service = _make_service(stock=10, price=Decimal("350.00"))
    data = _make_payload(items=[ItemCreate(producto_id=1, cantidad=2), ItemCreate(producto_id=1, cantidad=1)])
    pedido = service.create_order(usuario_id=1, data=data)
    assert pedido.total == Decimal("1050.00")


def test_create_order_calls_historial():
    service = _make_service()
    data = _make_payload()
    service.create_order(usuario_id=1, data=data)
    service.pedido_repo.create_historial.assert_called_once()
    historial_call = service.pedido_repo.create_historial.call_args[0][0]
    assert historial_call.estado_nuevo_id == 1
    assert historial_call.estado_anterior_id is None
    assert historial_call.cambiado_por == "SISTEMA"


def test_get_order_wrong_user_raises():
    service = _make_service()
    pedido = MagicMock()
    pedido.usuario_id = 99
    service.pedido_repo.get_by_id.return_value = pedido
    with pytest.raises(PermissionError):
        service.get_order(pedido_id=1, usuario_id=1)


def test_get_order_not_found_raises():
    service = _make_service()
    service.pedido_repo.get_by_id.return_value = None
    with pytest.raises(ValueError, match="Pedido no encontrado"):
        service.get_order(pedido_id=999, usuario_id=1)
