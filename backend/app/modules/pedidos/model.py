from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id", index=True)
    estado_id: int = Field(foreign_key="orderstate.id", default=1, index=True)
    total: Decimal = Field(decimal_places=2, max_digits=10)
    costo_envio: Decimal = Field(decimal_places=2, max_digits=10, default=Decimal("0.00"))
    # Address snapshot
    direccion_calle: str = Field(max_length=255)
    direccion_numero: Optional[str] = Field(default=None, max_length=20)
    direccion_piso: Optional[str] = Field(default=None, max_length=50)
    direccion_ciudad: str = Field(max_length=100)
    direccion_codigo_postal: Optional[str] = Field(default=None, max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["DetallePedido"] = Relationship(back_populates="pedido")
    historial: List["HistorialEstadoPedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="product.id")
    cantidad: int = Field(ge=1)
    precio_unitario: Decimal = Field(decimal_places=2, max_digits=10)
    subtotal: Decimal = Field(decimal_places=2, max_digits=10)
    exclusiones: List[int] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, server_default="[]"),
    )

    pedido: Optional[Pedido] = Relationship(back_populates="items")


class HistorialEstadoPedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    estado_anterior_id: Optional[int] = Field(default=None, foreign_key="orderstate.id")
    estado_nuevo_id: int = Field(foreign_key="orderstate.id")
    cambiado_por: str = Field(default="SISTEMA", max_length=100)
    observacion: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    pedido: Optional[Pedido] = Relationship(back_populates="historial")
