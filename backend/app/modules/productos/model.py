from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Product(SQLModel, table=True):
    """Product model with optional category association."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)

    category: Optional["Category"] = Relationship(back_populates="products")


# Import at the end to avoid circular imports
from app.modules.categorias.model import Category  # noqa: E402, F401
