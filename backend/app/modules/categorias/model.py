from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel

from app.modules.productos.pivot import ProductCategory


class Category(SQLModel, table=True):
    """Category model for organizing products."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
    slug: str = Field(max_length=100, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)

    products: List["Product"] = Relationship(
        back_populates="categories",
        link_model=ProductCategory,
    )


from app.modules.productos.model import Product  # noqa: E402, F401
