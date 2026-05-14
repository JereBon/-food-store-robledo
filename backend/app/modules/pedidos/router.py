from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import select

from app.core.deps import get_current_user
from app.core.rate_limit import limiter
from app.db.models import OrderState, User
from app.modules.direcciones.repository import DireccionRepository
from app.modules.pedidos.repository import PedidoRepository
from app.modules.pedidos.schemas import (
    DetallePedidoResponse,
    ItemCreate,
    PedidoCreate,
    PedidoListItem,
    PedidoResponse,
)
from app.modules.pedidos.service import InsufficientStockError, PedidoService
from app.modules.productos.model import Product
from app.modules.productos.repository import ProductRepository
from app.uow import UnitOfWork


router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def _get_service(uow: UnitOfWork) -> PedidoService:
    return PedidoService(
        pedido_repo=PedidoRepository(uow.session),
        direccion_repo=DireccionRepository(uow.session),
        producto_repo=ProductRepository(uow.session),
    )


def _get_estado_nombre(session, estado_id: int) -> str:
    state = session.get(OrderState, estado_id)
    return state.name if state else str(estado_id)


def _build_response(pedido, session) -> PedidoResponse:
    estado_nombre = _get_estado_nombre(session, pedido.estado_id)

    # Batch-load product names and images
    product_ids = list({i.producto_id for i in pedido.items})
    products_map: Dict[int, Product] = {}
    if product_ids:
        stmt = select(Product).where(Product.id.in_(product_ids))
        for p in session.exec(stmt).all():
            products_map[p.id] = p

    items = []
    for i in pedido.items:
        item_data = DetallePedidoResponse.model_validate(i)
        product = products_map.get(i.producto_id)
        if product:
            item_data.producto_nombre = product.name
            item_data.imagen_url = product.imagen_url
        items.append(item_data)

    data = PedidoResponse.model_validate(pedido)
    data.estado_nombre = estado_nombre
    data.items = items
    return data


@router.post("", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour")
def create_pedido(
    request: Request,
    payload: PedidoCreate,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        try:
            pedido = service.create_order(user.id, payload)
            uow.session.flush()
            uow.session.refresh(pedido)
            _ = pedido.items
            _ = pedido.historial
            return _build_response(pedido, uow.session)
        except InsufficientStockError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"message": str(e), "producto_id": e.producto_id, "disponible": e.available},
            )
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=List[PedidoListItem])
def list_pedidos(user: User = Depends(get_current_user)):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        pedidos = service.list_orders(user.id)
        result = []
        for p in pedidos:
            _ = p.items
            item = PedidoListItem(
                id=p.id,
                estado_id=p.estado_id,
                estado_nombre=_get_estado_nombre(uow.session, p.estado_id),
                total=p.total,
                created_at=p.created_at,
                num_items=sum(i.cantidad for i in p.items),
            )
            result.append(item)
        return result


@router.get("/{pedido_id}", response_model=PedidoResponse)
def get_pedido(pedido_id: int, user: User = Depends(get_current_user)):
    with UnitOfWork() as uow:
        service = _get_service(uow)
        try:
            pedido = service.get_order(pedido_id, user.id)
            _ = pedido.items
            _ = pedido.historial
            return _build_response(pedido, uow.session)
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
