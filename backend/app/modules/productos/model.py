from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel, Column, DECIMAL

from app.modules.productos.pivot import ProductCategory, ProductIngredient


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)

    categories: List["Category"] = Relationship(
        back_populates="products",
        link_model=ProductCategory,
    )
    ingredients: List["Ingrediente"] = Relationship(
        back_populates="products",
        link_model=ProductIngredient,
    )


from app.modules.categorias.model import Category  # noqa: E402, F401
from app.modules.ingredientes.model import Ingrediente  # noqa: E402, F401
