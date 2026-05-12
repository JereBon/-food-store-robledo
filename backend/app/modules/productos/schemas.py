from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryReadShort(BaseModel):
    """Short category info for product responses."""

    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(..., gt=0, description="Product price (must be > 0)")
    stock: int = Field(default=0, ge=0)
    category_id: Optional[int] = Field(default=None, description="Category ID (optional)")


class ProductCreate(ProductBase):
    """Schema for creating a new product."""

    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    category_id: Optional[int] = Field(default=None)


class ProductRead(ProductBase):
    """Schema for reading/returning product data."""

    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    category: Optional[CategoryReadShort] = None

    class Config:
        from_attributes = True
