from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.core.deps import get_current_user
from app.db.models import User
from app.modules.pagos.repository import FormaPagoRepository, PagoRepository
from app.modules.pagos.schemas import (
    CrearPreferenciaRequest,
    CrearPreferenciaResponse,
    FormaPagoResponse,
    PagoResponse,
    WebhookPayload,
)
from app.modules.pagos.service import PagoService
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductRepository
from app.uow import UnitOfWork

router = APIRouter(prefix="/pagos", tags=["pagos"])


def _get_service(uow: UnitOfWork) -> PagoService:
    return PagoService(
        pago_repo=PagoRepository(uow.session),
        forma_pago_repo=FormaPagoRepository(uow.session),
        pedido_repo=PedidoRepository(uow.session),
        producto_repo=ProductRepository(uow.session),
    )


@router.get("/formas-pago", response_model=List[FormaPagoResponse])
def listar_formas_pago():
    with UnitOfWork() as uow:
        repo = FormaPagoRepository(uow.session)
        return repo.list_active()


@router.post("/crear-preferencia", response_model=CrearPreferenciaResponse)
def crear_preferencia(
    body: CrearPreferenciaRequest,
    current_user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        try:
            return service.crear_preferencia(body.pedido_id, current_user.id)
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook(request: Request):
    try:
        body = await request.json()
        payload = WebhookPayload(**body)
        with UnitOfWork() as uow:
            service = _get_service(uow)
            service.process_webhook(payload)
    except Exception:
        pass
    return {"status": "ok"}


@router.get("/pedido/{pedido_id}", response_model=List[PagoResponse])
def listar_pagos_pedido(
    pedido_id: int,
    current_user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        pedido = PedidoRepository(uow.session).get_by_id(pedido_id)
        if not pedido:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
        if pedido.usuario_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
        return PagoRepository(uow.session).list_by_pedido(pedido_id)
