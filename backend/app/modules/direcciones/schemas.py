from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DireccionCreate(BaseModel):
    calle: str
    numero: Optional[str] = None
    piso: Optional[str] = None
    ciudad: str
    codigo_postal: Optional[str] = None


class DireccionUpdate(BaseModel):
    calle: Optional[str] = None
    numero: Optional[str] = None
    piso: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None


class DireccionResponse(BaseModel):
    id: int
    usuario_id: int
    calle: str
    numero: Optional[str] = None
    piso: Optional[str] = None
    ciudad: str
    codigo_postal: Optional[str] = None
    es_predeterminada: bool
    created_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
