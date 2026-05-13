from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingrediente"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True, index=True)
    es_alergeno: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)

    products: List["Product"] = Relationship(
        back_populates="ingredients",
        sa_relationship_kwargs={
            "secondary": "productoingrediente",
            "primaryjoin": "Ingrediente.id==ProductIngredient.ingrediente_id",
            "secondaryjoin": "Product.id==ProductIngredient.product_id",
        },
    )


from app.modules.productos.model import Product  # noqa: E402, F401
