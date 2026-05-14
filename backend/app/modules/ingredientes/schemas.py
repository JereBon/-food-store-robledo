from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IngredienteBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    es_alergeno: bool = Field(default=False)


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    es_alergeno: Optional[bool] = Field(default=None)


class IngredienteRead(IngredienteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IngredientReadShort(BaseModel):
    id: int
    nombre: str
    es_alergeno: bool
    es_removible: bool = False

    class Config:
        from_attributes = True


class IngredientListResponse(BaseModel):
    items: list[IngredienteRead]
    total: int
    skip: int
    limit: int
