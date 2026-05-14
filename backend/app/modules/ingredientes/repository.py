from typing import Optional

from sqlmodel import Session, select, func

from app.repositories.base import BaseRepository
from app.modules.ingredientes.model import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        stmt = select(Ingrediente).where(Ingrediente.nombre == nombre)
        return self.session.exec(stmt).first()

    def list_filtered(
        self,
        *,
        include_deleted: bool = False,
        es_alergeno: Optional[bool] = None,
    ) -> list[Ingrediente]:
        stmt = select(Ingrediente)
        if not include_deleted:
            stmt = stmt.where(Ingrediente.deleted_at.is_(None))
        if es_alergeno is not None:
            stmt = stmt.where(Ingrediente.es_alergeno == es_alergeno)
        return list(self.session.exec(stmt).all())

    def list_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        *,
        include_deleted: bool = False,
        es_alergeno: Optional[bool] = None,
    ) -> tuple[list[Ingrediente], int]:
        """Return (items, total) with pagination."""
        base = select(Ingrediente)
        if not include_deleted:
            base = base.where(Ingrediente.deleted_at.is_(None))
        if es_alergeno is not None:
            base = base.where(Ingrediente.es_alergeno == es_alergeno)

        count_stmt = select(func.count()).select_from(base.subquery())
        total = self.session.exec(count_stmt).one()

        query = base.offset(skip).limit(limit).order_by(Ingrediente.nombre)
        items = list(self.session.exec(query).all())
        return items, total
