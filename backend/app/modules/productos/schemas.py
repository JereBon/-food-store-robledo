from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class CategoryReadShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


class IngredientReadShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    es_alergeno: bool
    es_removible: bool = False


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Decimal = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    category_ids: list[int] = Field(default_factory=list)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[Decimal] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    category_ids: Optional[list[int]] = Field(default=None)


class ProductRead(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    categories: list[CategoryReadShort] = Field(default_factory=list)
    ingredients: list[IngredientReadShort] = Field(default_factory=list)
    category_ids: list[int] = Field(default_factory=list, exclude=True)

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    total: int
    skip: int
    limit: int
