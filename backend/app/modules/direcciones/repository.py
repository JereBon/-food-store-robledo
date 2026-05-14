from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.modules.direcciones.model import DireccionEntrega
from app.repositories.base import BaseRepository


class DireccionRepository(BaseRepository[DireccionEntrega]):
    def __init__(self, session: Session):
        super().__init__(session, DireccionEntrega)

    def list_by_user(self, usuario_id: int, include_deleted: bool = False) -> list[DireccionEntrega]:
        stmt = select(DireccionEntrega).where(DireccionEntrega.usuario_id == usuario_id)
        if not include_deleted:
            stmt = stmt.where(DireccionEntrega.deleted_at.is_(None))
        return list(self.session.exec(stmt).all())

    def list_deleted_by_user(self, usuario_id: int) -> list[DireccionEntrega]:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.usuario_id == usuario_id)
            .where(DireccionEntrega.deleted_at.is_not(None))
        )
        return list(self.session.exec(stmt).all())

    def get_by_id_and_user(self, direccion_id: int, usuario_id: int, include_deleted: bool = False) -> Optional[DireccionEntrega]:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.id == direccion_id)
            .where(DireccionEntrega.usuario_id == usuario_id)
        )
        if not include_deleted:
            stmt = stmt.where(DireccionEntrega.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_default(self, usuario_id: int) -> Optional[DireccionEntrega]:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.usuario_id == usuario_id)
            .where(DireccionEntrega.es_predeterminada == True)
            .where(DireccionEntrega.deleted_at.is_(None))
        )
        return self.session.exec(stmt).first()

    def count_active(self, usuario_id: int) -> int:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.usuario_id == usuario_id)
            .where(DireccionEntrega.deleted_at.is_(None))
        )
        return len(list(self.session.exec(stmt).all()))

    def unset_all_defaults(self, usuario_id: int) -> None:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.usuario_id == usuario_id)
            .where(DireccionEntrega.es_predeterminada == True)
            .where(DireccionEntrega.deleted_at.is_(None))
        )
        for d in self.session.exec(stmt).all():
            d.es_predeterminada = False
            self.session.add(d)

    def set_default(self, direccion_id: int, usuario_id: int) -> Optional[DireccionEntrega]:
        self.unset_all_defaults(usuario_id)
        self.session.flush()
        direccion = self.get_by_id_and_user(direccion_id, usuario_id)
        if direccion:
            direccion.es_predeterminada = True
            self.session.add(direccion)
        return direccion

    def get_first_active(self, usuario_id: int) -> Optional[DireccionEntrega]:
        stmt = (
            select(DireccionEntrega)
            .where(DireccionEntrega.usuario_id == usuario_id)
            .where(DireccionEntrega.deleted_at.is_(None))
            .order_by(DireccionEntrega.created_at)
        )
        return self.session.exec(stmt).first()

    def restore(self, direccion_id: int) -> Optional[DireccionEntrega]:
        """Restore a soft-deleted address by setting deleted_at to None."""
        direccion = self.session.get(DireccionEntrega, direccion_id)
        if direccion and direccion.deleted_at is not None:
            direccion.deleted_at = None
            self.session.add(direccion)
        return direccion
