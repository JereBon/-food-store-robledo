from datetime import datetime
from typing import List, Optional

from app.modules.direcciones.model import DireccionEntrega
from app.modules.direcciones.repository import DireccionRepository
from app.modules.direcciones.schemas import DireccionCreate, DireccionUpdate


class DireccionService:
    def __init__(self, repo: DireccionRepository):
        self.repo = repo

    def create(self, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
        is_first = self.repo.count_active(usuario_id) == 0
        direccion = DireccionEntrega(
            usuario_id=usuario_id,
            calle=data.calle,
            numero=data.numero,
            piso=data.piso,
            ciudad=data.ciudad,
            codigo_postal=data.codigo_postal,
            es_predeterminada=is_first,
        )
        return self.repo.create(direccion)

    def list(self, usuario_id: int, include_deleted: bool = False) -> List[DireccionEntrega]:
        return self.repo.list_by_user(usuario_id, include_deleted)

    def list_deleted(self, usuario_id: int) -> List[DireccionEntrega]:
        return self.repo.list_deleted_by_user(usuario_id)

    def get_owned(self, direccion_id: int, usuario_id: int, include_deleted: bool = False) -> Optional[DireccionEntrega]:
        return self.repo.get_by_id_and_user(direccion_id, usuario_id, include_deleted)

    def update(self, direccion: DireccionEntrega, data: DireccionUpdate) -> DireccionEntrega:
        update_dict = data.model_dump(exclude_unset=True)
        return self.repo.update(direccion, update_dict)

    def delete(self, direccion: DireccionEntrega, usuario_id: int) -> None:
        was_default = direccion.es_predeterminada
        self.repo.soft_delete(direccion)
        if was_default:
            next_one = self.repo.get_first_active(usuario_id)
            if next_one:
                next_one.es_predeterminada = True
                self.repo.session.add(next_one)

    def set_default(self, direccion_id: int, usuario_id: int) -> Optional[DireccionEntrega]:
        return self.repo.set_default(direccion_id, usuario_id)

    def restore(self, direccion_id: int, usuario_id: int) -> Optional[DireccionEntrega]:
        """Restore a soft-deleted address. Must belong to the user."""
        direccion = self.repo.restore(direccion_id)
        if direccion and direccion.usuario_id != usuario_id:
            return None
        return direccion
