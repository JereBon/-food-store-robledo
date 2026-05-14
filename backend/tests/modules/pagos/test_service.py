"""Tests for PagoService"""
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from app.modules.pagos.schemas import WebhookData, WebhookPayload
from app.modules.pagos.service import PagoService


def _make_service(*, estado_id=1, same_user=True, existing_pago=None, stock=10):
    pago_repo = MagicMock()
    forma_pago_repo = MagicMock()
    pedido_repo = MagicMock()
    producto_repo = MagicMock()

    pedido = MagicMock()
    pedido.id = 1
    pedido.usuario_id = 42 if same_user else 99
    pedido.estado_id = estado_id
    pedido.total = Decimal("500.00")
    pedido_repo.get_by_id.return_value = pedido

    detalle = MagicMock()
    detalle.producto_id = 1
    detalle.cantidad = 2
    detalle.precio_unitario = Decimal("250.00")
    pedido_repo.get_detalles_by_pedido.return_value = [detalle]

    product = MagicMock()
    product.id = 1
    product.stock = stock
    producto_repo.get_by_id.return_value = product

    pago_repo.get_by_idempotency_key.return_value = existing_pago

    return PagoService(pago_repo, forma_pago_repo, pedido_repo, producto_repo)


@patch("app.modules.pagos.service.settings")
@patch("app.modules.pagos.service._get_sdk")
def test_crear_preferencia_success(mock_sdk, mock_settings):
    mock_settings.backend_url = "https://api.production.com"
    mock_settings.frontend_url = "https://app.production.com"
    sdk = MagicMock()
    sdk.preference.return_value.create.return_value = {
        "status": 201,
        "response": {"id": "pref-123", "init_point": "https://mp.com/pay/pref-123"}
    }
    mock_sdk.return_value = sdk

    service = _make_service(estado_id=1)
    result = service.crear_preferencia(pedido_id=1, usuario_id=42)

    assert result.preference_id == "pref-123"
    assert result.init_point == "https://mp.com/pay/pref-123"


@patch("app.modules.pagos.service._get_sdk")
def test_crear_preferencia_wrong_user_raises(mock_sdk):
    service = _make_service(same_user=False)
    with pytest.raises(PermissionError):
        service.crear_preferencia(pedido_id=1, usuario_id=42)


@patch("app.modules.pagos.service._get_sdk")
def test_crear_preferencia_not_pendiente_raises(mock_sdk):
    service = _make_service(estado_id=2)
    with pytest.raises(ValueError, match="PENDIENTE"):
        service.crear_preferencia(pedido_id=1, usuario_id=42)


@patch("app.modules.pagos.service._get_sdk")
def test_process_webhook_approved_transitions_order(mock_sdk):
    sdk = MagicMock()
    sdk.payment.return_value.get.return_value = {
        "response": {
            "status": "approved",
            "external_reference": "1",
            "transaction_amount": 500.00,
        }
    }
    mock_sdk.return_value = sdk

    service = _make_service(estado_id=1, stock=10)
    payload = WebhookPayload(type="payment", data=WebhookData(id="mp-pay-001"))
    service.process_webhook(payload)

    service.pago_repo.create.assert_called_once()
    pago = service.pago_repo.create.call_args[0][0]
    assert pago.mp_status == "approved"

    pedido = service.pedido_repo.get_by_id.return_value
    assert pedido.estado_id == 2

    service.pedido_repo.create_historial.assert_called_once()


@patch("app.modules.pagos.service._get_sdk")
def test_process_webhook_rejected_keeps_order_pendiente(mock_sdk):
    sdk = MagicMock()
    sdk.payment.return_value.get.return_value = {
        "response": {
            "status": "rejected",
            "external_reference": "1",
            "transaction_amount": 500.00,
        }
    }
    mock_sdk.return_value = sdk

    service = _make_service(estado_id=1)
    payload = WebhookPayload(type="payment", data=WebhookData(id="mp-pay-002"))
    service.process_webhook(payload)

    pago = service.pago_repo.create.call_args[0][0]
    assert pago.mp_status == "rejected"

    pedido = service.pedido_repo.get_by_id.return_value
    assert pedido.estado_id == 1


@patch("app.modules.pagos.service._get_sdk")
def test_process_webhook_duplicate_ignored(mock_sdk):
    sdk = MagicMock()
    sdk.payment.return_value.get.return_value = {
        "response": {
            "status": "approved",
            "external_reference": "1",
            "transaction_amount": 500.00,
        }
    }
    mock_sdk.return_value = sdk

    existing = MagicMock()
    service = _make_service(existing_pago=existing)

    payload = WebhookPayload(type="payment", data=WebhookData(id="mp-pay-003"))
    service.process_webhook(payload)

    service.pago_repo.create.assert_not_called()


@patch("app.modules.pagos.service._get_sdk")
def test_process_webhook_empty_payload_noop(mock_sdk):
    service = _make_service()
    payload = WebhookPayload(type="payment", data=None)
    service.process_webhook(payload)
    mock_sdk.assert_not_called()
