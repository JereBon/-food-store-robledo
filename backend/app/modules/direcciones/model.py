from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DireccionEntrega(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="user.id", index=True)
    calle: str = Field(max_length=255)
    numero: Optional[str] = Field(default=None, max_length=20)
    piso: Optional[str] = Field(default=None, max_length=50)
    ciudad: str = Field(max_length=100)
    codigo_postal: Optional[str] = Field(default=None, max_length=20)
    es_predeterminada: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)
