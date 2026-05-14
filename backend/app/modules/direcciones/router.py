from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.db.models import User
from app.modules.direcciones.repository import DireccionRepository
from app.modules.direcciones.schemas import DireccionCreate, DireccionResponse, DireccionUpdate
from app.modules.direcciones.service import DireccionService
from app.uow import UnitOfWork


router = APIRouter(prefix="/direcciones", tags=["direcciones"])


def _get_service(uow: UnitOfWork) -> DireccionService:
    return DireccionService(DireccionRepository(uow.session))


@router.post("", response_model=DireccionResponse, status_code=status.HTTP_201_CREATED)
def create_direccion(
    payload: DireccionCreate,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        direccion = service.create(user.id, payload)
        uow.session.flush()
        uow.session.refresh(direccion)
        return DireccionResponse.model_validate(direccion)


@router.get("", response_model=List[DireccionResponse])
def list_direcciones(
    incluir_eliminadas: bool = False,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        return [DireccionResponse.model_validate(d) for d in service.list(user.id, include_deleted=incluir_eliminadas)]


@router.get("/eliminadas", response_model=List[DireccionResponse])
def list_direcciones_eliminadas(user: User = Depends(get_current_user)):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        return [DireccionResponse.model_validate(d) for d in service.list_deleted(user.id)]


@router.patch("/{direccion_id}", response_model=DireccionResponse)
def update_direccion(
    direccion_id: int,
    payload: DireccionUpdate,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        direccion = service.get_owned(direccion_id, user.id)
        if not direccion:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
        updated = service.update(direccion, payload)
        return DireccionResponse.model_validate(updated)


@router.delete("/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direccion(
    direccion_id: int,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        direccion = service.get_owned(direccion_id, user.id)
        if not direccion:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
        service.delete(direccion, user.id)


@router.patch("/{direccion_id}/predeterminada", response_model=DireccionResponse)
def set_predeterminada(
    direccion_id: int,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        direccion = service.set_default(direccion_id, user.id)
        if not direccion:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
        return DireccionResponse.model_validate(direccion)


@router.patch("/{direccion_id}/reactivar", response_model=DireccionResponse)
def reactivar_direccion(
    direccion_id: int,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        direccion = service.restore(direccion_id, user.id)
        if not direccion:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
        uow.session.flush()
        uow.session.refresh(direccion)
        return DireccionResponse.model_validate(direccion)
