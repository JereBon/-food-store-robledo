from decimal import Decimal
from typing import List

from app.modules.direcciones.repository import DireccionRepository
from app.modules.pedidos.model import DetallePedido, HistorialEstadoPedido, Pedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.pedidos.schemas import ItemCreate, PedidoCreate
from app.modules.productos.repository import ProductRepository


class InsufficientStockError(ValueError):
    def __init__(self, producto_id: int, requested: int, available: int):
        self.producto_id = producto_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Stock insuficiente para producto {producto_id}: solicitado {requested}, disponible {available}"
        )


class PedidoService:
    def __init__(
        self,
        pedido_repo: PedidoRepository,
        direccion_repo: DireccionRepository,
        producto_repo: ProductRepository,
    ):
        self.pedido_repo = pedido_repo
        self.direccion_repo = direccion_repo
        self.producto_repo = producto_repo

    def create_order(self, usuario_id: int, data: PedidoCreate) -> Pedido:
        direccion = self.direccion_repo.get_by_id_and_user(data.direccion_id, usuario_id)
        if not direccion:
            raise ValueError(f"Dirección {data.direccion_id} no encontrada")

        # Validate stock for all items before any INSERT (SELECT FOR UPDATE)
        stock_errors: List[InsufficientStockError] = []
        price_snapshots: dict[int, Decimal] = {}

        for item in data.items:
            product = self.producto_repo.get_by_id(item.producto_id)
            if not product or product.deleted_at is not None:
                raise ValueError(f"Producto {item.producto_id} no encontrado")

            available = self.pedido_repo.get_stock_for_update(item.producto_id)
            if available is None or available < item.cantidad:
                stock_errors.append(
                    InsufficientStockError(item.producto_id, item.cantidad, available or 0)
                )
            price_snapshots[item.producto_id] = product.price

        if stock_errors:
            raise stock_errors[0]

        total = Decimal("0.00")
        for item in data.items:
            total += price_snapshots[item.producto_id] * item.cantidad

        pedido = Pedido(
            usuario_id=usuario_id,
            estado_id=1,
            total=total,
            costo_envio=Decimal("0.00"),
            direccion_calle=direccion.calle,
            direccion_numero=direccion.numero,
            direccion_piso=direccion.piso,
            direccion_ciudad=direccion.ciudad,
            direccion_codigo_postal=direccion.codigo_postal,
        )
        self.pedido_repo.create_pedido(pedido)

        for item in data.items:
            precio = price_snapshots[item.producto_id]
            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=precio,
                subtotal=precio * item.cantidad,
                exclusiones=item.exclusiones,
            )
            self.pedido_repo.create_detalle(detalle)

        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_anterior_id=None,
            estado_nuevo_id=1,
            cambiado_por="SISTEMA",
        )
        self.pedido_repo.create_historial(historial)

        # Decrease stock for each product (within the same transaction)
        for item in data.items:
            product = self.producto_repo.get_by_id(item.producto_id)
            if product:
                product.stock -= item.cantidad
                self.producto_repo.session.add(product)

        return pedido

    def list_orders(self, usuario_id: int) -> list[Pedido]:
        return self.pedido_repo.list_by_user(usuario_id)

    def get_order(self, pedido_id: int, usuario_id: int) -> Pedido:
        pedido = self.pedido_repo.get_by_id(pedido_id)
        if not pedido:
            raise ValueError("Pedido no encontrado")
        if pedido.usuario_id != usuario_id:
            raise PermissionError("Acceso denegado")
        return pedido
