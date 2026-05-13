from typing import Optional

from sqlmodel import Session, select

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
