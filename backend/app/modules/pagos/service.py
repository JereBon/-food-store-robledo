from decimal import Decimal
from typing import Any

import mercadopago

from app.core.config import settings
from app.modules.pagos.model import Pago
from app.modules.pagos.repository import FormaPagoRepository, PagoRepository
from app.modules.pagos.schemas import CrearPreferenciaResponse, WebhookPayload
from app.modules.pedidos.model import HistorialEstadoPedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductRepository


def _get_sdk() -> Any:
    return mercadopago.SDK(settings.mercadopago_access_token)


class PagoService:
    def __init__(
        self,
        pago_repo: PagoRepository,
        forma_pago_repo: FormaPagoRepository,
        pedido_repo: PedidoRepository,
        producto_repo: ProductRepository,
    ):
        self.pago_repo = pago_repo
        self.forma_pago_repo = forma_pago_repo
        self.pedido_repo = pedido_repo
        self.producto_repo = producto_repo

    def crear_preferencia(self, pedido_id: int, usuario_id: int) -> CrearPreferenciaResponse:
        pedido = self.pedido_repo.get_by_id(pedido_id)
        if not pedido:
            raise ValueError("Pedido no encontrado")
        if pedido.usuario_id != usuario_id:
            raise PermissionError("Acceso denegado")
        if pedido.estado_id != 1:
            raise ValueError("El pedido no está en estado PENDIENTE")

        items_mp = []
        for detalle in self.pedido_repo.get_detalles_by_pedido(pedido_id):
            items_mp.append({
                "title": f"Producto {detalle.producto_id}",
                "quantity": detalle.cantidad,
                "unit_price": float(detalle.precio_unitario),
                "currency_id": "ARS",
            })

        if not items_mp:
            items_mp = [{"title": "Pedido", "quantity": 1, "unit_price": float(pedido.total), "currency_id": "ARS"}]

        is_local = "localhost" in settings.backend_url

        if is_local:
            # Auto-confirm order in dev mode: PENDIENTE ⟶ CONFIRMADO + decrement stock
            if pedido.estado_id == 1:
                for detalle in self.pedido_repo.get_detalles_by_pedido(pedido.id):
                    product = self.producto_repo.get_by_id(detalle.producto_id)
                    if product and product.stock >= detalle.cantidad:
                        product.stock -= detalle.cantidad
                        self.producto_repo.session.add(product)

                pedido.estado_id = 2
                self.pedido_repo.session.add(pedido)

                historial = HistorialEstadoPedido(
                    pedido_id=pedido.id,
                    estado_anterior_id=1,
                    estado_nuevo_id=2,
                    cambiado_por="SISTEMA",
                    observacion="Pago simulado en entorno local",
                )
                self.pedido_repo.create_historial(historial)

            fake_id = f"dev-pref-{pedido.id}"
            return CrearPreferenciaResponse(
                preference_id=fake_id,
                init_point=f"{settings.frontend_url}/pago/exito?pedido={pedido.id}",
            )

        preference_data: dict = {
            "items": items_mp,
            "external_reference": str(pedido.id),
            "back_urls": {
                "success": f"{settings.backend_url}/pago/exito",
                "pending": f"{settings.backend_url}/pago/pendiente",
                "failure": f"{settings.backend_url}/pago/fallo",
            },
            "auto_return": "approved",
            "notification_url": f"{settings.backend_url}/api/v1/pagos/webhook",
        }

        sdk = _get_sdk()
        result = sdk.preference().create(preference_data)
        if result.get("status") not in (200, 201):
            error_msg = result.get("response", {}).get("message", "Error al crear preferencia en MercadoPago")
            raise ValueError(f"MercadoPago error ({result.get('status')}): {error_msg}")
        preference = result.get("response", {})
        if not preference.get("id"):
            raise ValueError(f"MercadoPago no devolvió preference_id. Respuesta: {result}")

        return CrearPreferenciaResponse(
            preference_id=preference["id"],
            init_point=preference["init_point"],
        )

    def process_webhook(self, payload: WebhookPayload) -> None:
        if not payload.data or not payload.data.id:
            return

        payment_id = payload.data.id
        sdk = _get_sdk()
        payment_response = sdk.payment().get(payment_id)
        payment = payment_response.get("response", {})

        mp_status = payment.get("status", "unknown")
        external_reference = payment.get("external_reference")
        transaction_amount = Decimal(str(payment.get("transaction_amount", 0)))

        idempotency_key = f"{external_reference}-{payment_id}"

        existing = self.pago_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return

        pago = Pago(
            pedido_id=int(external_reference) if external_reference else 0,
            monto=transaction_amount,
            mp_payment_id=str(payment_id),
            mp_status=mp_status,
            external_reference=external_reference,
            idempotency_key=idempotency_key,
        )
        self.pago_repo.create(pago)

        if mp_status == "approved" and external_reference:
            pedido = self.pedido_repo.get_by_id(int(external_reference))
            if pedido and pedido.estado_id == 1:
                # Transition PENDIENTE→CONFIRMADO (id=2) and decrement stock
                for detalle in self.pedido_repo.get_detalles_by_pedido(pedido.id):
                    product = self.producto_repo.get_by_id(detalle.producto_id)
                    if product and product.stock >= detalle.cantidad:
                        product.stock -= detalle.cantidad
                        self.producto_repo.session.add(product)

                pedido.estado_id = 2
                self.pedido_repo.session.add(pedido)

                historial = HistorialEstadoPedido(
                    pedido_id=pedido.id,
                    estado_anterior_id=1,
                    estado_nuevo_id=2,
                    cambiado_por="SISTEMA",
                    observacion=f"Pago aprobado MP: {payment_id}",
                )
                self.pedido_repo.create_historial(historial)
