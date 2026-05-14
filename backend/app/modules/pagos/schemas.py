from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FormaPagoResponse(BaseModel):
    id: int
    nombre: str
    activo: bool

    model_config = {"from_attributes": True}


class CrearPreferenciaRequest(BaseModel):
    pedido_id: int


class CrearPreferenciaResponse(BaseModel):
    preference_id: str
    init_point: str


class PagoResponse(BaseModel):
    id: int
    pedido_id: int
    monto: Decimal
    mp_payment_id: Optional[str]
    mp_status: str
    external_reference: Optional[str]
    idempotency_key: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WebhookData(BaseModel):
    id: Optional[str] = None


class WebhookPayload(BaseModel):
    type: Optional[str] = None
    data: Optional[WebhookData] = None
