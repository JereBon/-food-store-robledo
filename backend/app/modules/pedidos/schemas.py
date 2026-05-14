from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class ItemCreate(BaseModel):
    producto_id: int
    cantidad: int
    exclusiones: List[int] = []


class PedidoCreate(BaseModel):
    direccion_id: int
    forma_pago_id: int
    items: List[ItemCreate]


class DetallePedidoResponse(BaseModel):
    id: int
    producto_id: int
    producto_nombre: str = ""
    imagen_url: Optional[str] = None
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    exclusiones: List[int]

    model_config = {"from_attributes": True}


class PedidoResponse(BaseModel):
    id: int
    usuario_id: int
    estado_id: int
    estado_nombre: Optional[str] = None
    total: Decimal
    costo_envio: Decimal
    direccion_calle: str
    direccion_numero: Optional[str] = None
    direccion_piso: Optional[str] = None
    direccion_ciudad: str
    direccion_codigo_postal: Optional[str] = None
    created_at: datetime
    items: List[DetallePedidoResponse] = []

    model_config = {"from_attributes": True}


class PedidoListItem(BaseModel):
    id: int
    estado_id: int
    estado_nombre: Optional[str] = None
    total: Decimal
    created_at: datetime
    num_items: int = 0

    model_config = {"from_attributes": True}
