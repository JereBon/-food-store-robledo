from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ── User management schemas ──────────────────────────────────────────

class UserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    is_active: bool = True
    roles: list[str]
    created_at: datetime


class UserListResponse(BaseModel):
    items: list[UserListItem]
    total: int
    page: int
    page_size: int


class UserUpdateRequest(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    is_active: Optional[bool] = None
    roles: Optional[list[str]] = None


# ── Metrics schemas ──────────────────────────────────────────────────

class PedidosPorEstadoItem(BaseModel):
    code: str
    name: str
    cantidad: int


class MetricasResumenResponse(BaseModel):
    total_ventas: float
    total_pedidos: int
    pedidos_por_estado: list[PedidosPorEstadoItem]
    total_usuarios: int


class VentasPorPeriodoItem(BaseModel):
    periodo: str
    monto: float
    cantidad: int


class VentasPorPeriodoResponse(BaseModel):
    items: list[VentasPorPeriodoItem]


class TopProductoItem(BaseModel):
    producto_id: int
    nombre: str
    total_unidades: int


class TopProductosResponse(BaseModel):
    items: list[TopProductoItem]
