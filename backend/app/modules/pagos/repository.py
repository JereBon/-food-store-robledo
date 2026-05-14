from typing import Optional

from sqlmodel import Session, select

from app.modules.pagos.model import FormaPago, Pago


class PagoRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, pago: Pago) -> Pago:
        self.session.add(pago)
        self.session.flush()
        return pago

    def get_by_idempotency_key(self, key: str) -> Optional[Pago]:
        stmt = select(Pago).where(Pago.idempotency_key == key)
        return self.session.exec(stmt).first()

    def list_by_pedido(self, pedido_id: int) -> list[Pago]:
        stmt = select(Pago).where(Pago.pedido_id == pedido_id).order_by(Pago.created_at)
        return list(self.session.exec(stmt).all())


class FormaPagoRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_active(self) -> list[FormaPago]:
        stmt = select(FormaPago).where(FormaPago.activo == True)  # noqa: E712
        return list(self.session.exec(stmt).all())

    def get_by_id(self, forma_pago_id: int) -> Optional[FormaPago]:
        return self.session.get(FormaPago, forma_pago_id)
