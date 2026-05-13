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
