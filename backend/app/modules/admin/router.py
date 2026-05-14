from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.db.models import User
from app.modules.admin.schemas import (
    MetricasResumenResponse,
    TopProductosResponse,
    UserListItem,
    UserListResponse,
    UserUpdateRequest,
    VentasPorPeriodoResponse,
)
from app.modules.admin import service as admin_service
from app.uow import UnitOfWork


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/usuarios", response_model=UserListResponse)
def list_usuarios(
    q: Optional[str] = Query(default=None),
    rol: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user: User = Depends(require_role(["ADMIN"])),
):
    with UnitOfWork() as uow:
        return admin_service.list_users(
            uow, q=q, rol=rol, page=page, page_size=page_size
        )


@router.put("/usuarios/{user_id}", response_model=UserListItem)
def update_usuario(
    user_id: int,
    payload: UserUpdateRequest,
    user: User = Depends(require_role(["ADMIN"])),
):
    with UnitOfWork() as uow:
        result = admin_service.update_user(uow, user_id, payload)
        return result


@router.get("/metricas/resumen", response_model=MetricasResumenResponse)
def get_metricas_resumen(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
    user: User = Depends(require_role(["ADMIN"])),
):
    _desde = _parse_date(desde) if desde else None
    _hasta = _parse_date(hasta, end_of_day=True) if hasta else None
    with UnitOfWork() as uow:
        return admin_service.get_metricas_resumen(uow, desde=_desde, hasta=_hasta)


@router.get("/metricas/ventas", response_model=VentasPorPeriodoResponse)
def get_metricas_ventas(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
    granularidad: str = Query(default="dia", pattern="^(dia|semana|mes)$"),
    user: User = Depends(require_role(["ADMIN"])),
):
    _desde = _parse_date(desde) if desde else None
    _hasta = _parse_date(hasta, end_of_day=True) if hasta else None
    with UnitOfWork() as uow:
        return admin_service.get_ventas_series(
            uow, desde=_desde, hasta=_hasta, granularidad=granularidad
        )


@router.get("/metricas/productos-top", response_model=TopProductosResponse)
def get_metricas_top_productos(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
    limite: int = Query(default=10, ge=1, le=50),
    user: User = Depends(require_role(["ADMIN"])),
):
    _desde = _parse_date(desde) if desde else None
    _hasta = _parse_date(hasta, end_of_day=True) if hasta else None
    with UnitOfWork() as uow:
        return admin_service.get_top_productos(
            uow, desde=_desde, hasta=_hasta, limite=limite
        )


def _parse_date(value: str, end_of_day: bool = False) -> datetime:
    """Parse an ISO date string (YYYY-MM-DD) to datetime UTC."""
    try:
        d = date.fromisoformat(value)
        if end_of_day:
            return datetime(d.year, d.month, d.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
        return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Formato de fecha inválido: {value}. Use YYYY-MM-DD",
        )
