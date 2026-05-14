from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.modules.admin.schemas import (
    MetricasResumenResponse,
    PedidosPorEstadoItem,
    TopProductoItem,
    TopProductosResponse,
    UserListItem,
    UserListResponse,
    UserUpdateRequest,
    VentasPorPeriodoItem,
    VentasPorPeriodoResponse,
)
from app.uow import UnitOfWork


def list_users(
    uow: UnitOfWork,
    q: str | None = None,
    rol: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> UserListResponse:
    users, total = uow.admin.list_users(q=q, rol=rol, page=page, page_size=page_size)
    items = [
        UserListItem(
            id=u.id,
            nombre=u.nombre,
            apellido=u.apellido,
            email=u.email,
            telefono=u.telefono,
            is_active=u.is_active,
            roles=[r.code for r in (u.roles or [])],
            created_at=u.created_at,
        )
        for u in users
    ]
    return UserListResponse(items=items, total=total, page=page, page_size=page_size)


def get_user(uow: UnitOfWork, user_id: int) -> UserListItem:
    user = uow.admin.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return UserListItem(
        id=user.id,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        telefono=user.telefono,
        is_active=user.is_active,
        roles=[r.code for r in (user.roles or [])],
        created_at=user.created_at,
    )


def update_user(uow: UnitOfWork, user_id: int, request: UserUpdateRequest) -> UserListItem:
    user = uow.admin.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    data = request.model_dump(exclude_unset=True)

    # RN-RB04: No degradar al último ADMIN
    if "roles" in data and "ADMIN" not in [r.upper() for r in data["roles"]]:
        # Check if this user is ADMIN
        user_roles = [r.code for r in (user.roles or [])]
        if "ADMIN" in user_roles:
            admin_count = uow.admin.count_admins()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No se puede degradar al único administrador del sistema",
                )

    # Handle role changes
    if "roles" in data:
        roles = data.pop("roles")
        uow.admin.set_user_roles(user_id, roles)
        # Expire user object so roles relationship reloads from DB
        uow.session.expire(user, attribute_names=["roles"])

    # Handle deactivation — revoke all refresh tokens
    if "is_active" in data and data["is_active"] is False:
        uow.admin.revoke_all_refresh_tokens(user_id)

    # Update other fields
    updated_user = uow.admin.update_user(user_id, data)
    if updated_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    return UserListItem(
        id=updated_user.id,
        nombre=updated_user.nombre,
        apellido=updated_user.apellido,
        email=updated_user.email,
        telefono=updated_user.telefono,
        is_active=updated_user.is_active,
        roles=[r.code for r in (updated_user.roles or [])],
        created_at=updated_user.created_at,
    )


def get_metricas_resumen(
    uow: UnitOfWork,
    desde: datetime | None = None,
    hasta: datetime | None = None,
) -> MetricasResumenResponse:
    data = uow.admin.get_resumen(desde=desde, hasta=hasta)
    return MetricasResumenResponse(
        total_ventas=data["total_ventas"],
        total_pedidos=data["total_pedidos"],
        pedidos_por_estado=[
            PedidosPorEstadoItem(**p) for p in data["pedidos_por_estado"]
        ],
        total_usuarios=data["total_usuarios"],
    )


def get_ventas_series(
    uow: UnitOfWork,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    granularidad: str = "dia",
) -> VentasPorPeriodoResponse:
    items_data = uow.admin.get_ventas_series(
        desde=desde, hasta=hasta, granularidad=granularidad
    )
    items = [VentasPorPeriodoItem(**i) for i in items_data]
    return VentasPorPeriodoResponse(items=items)


def get_top_productos(
    uow: UnitOfWork,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    limite: int = 10,
) -> TopProductosResponse:
    items_data = uow.admin.get_top_productos(
        desde=desde, hasta=hasta, limite=limite
    )
    items = [TopProductoItem(**i) for i in items_data]
    return TopProductosResponse(items=items)
