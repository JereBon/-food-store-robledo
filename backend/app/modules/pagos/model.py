from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlmodel import Field, SQLModel


class FormaPago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Pago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    monto: Decimal = Field(decimal_places=2, max_digits=10)
    mp_payment_id: Optional[str] = Field(default=None, max_length=100)
    mp_status: str = Field(max_length=50)
    external_reference: Optional[str] = Field(default=None, max_length=100)
    idempotency_key: str = Field(max_length=200, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
