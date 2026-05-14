from decimal import Decimal
from typing import Optional

from sqlalchemy import text
from sqlmodel import Session, select

from app.modules.pedidos.model import DetallePedido, HistorialEstadoPedido, Pedido
from app.repositories.base import BaseRepository


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_by_id(self, pedido_id: int) -> Optional[Pedido]:
        return self.session.get(Pedido, pedido_id)

    def list_by_user(self, usuario_id: int, limit: int = 20) -> list[Pedido]:
        stmt = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .order_by(Pedido.created_at.desc())
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def get_stock_for_update(self, producto_id: int) -> Optional[int]:
        """Lock the product row and return its stock. Falls back to plain SELECT in SQLite (tests)."""
        try:
            result = self.session.exec(
                text("SELECT stock FROM product WHERE id = :id FOR UPDATE").bindparams(id=producto_id)
            ).fetchone()
        except Exception:
            result = self.session.exec(
                text("SELECT stock FROM product WHERE id = :id").bindparams(id=producto_id)
            ).fetchone()
        return result[0] if result else None

    def create_pedido(self, pedido: Pedido) -> Pedido:
        self.session.add(pedido)
        self.session.flush()
        return pedido

    def create_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        return detalle

    def create_historial(self, historial: HistorialEstadoPedido) -> HistorialEstadoPedido:
        self.session.add(historial)
        return historial
