from sqlmodel import Field, SQLModel


class ProductCategory(SQLModel, table=True):
    __tablename__ = "productocategoria"
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    category_id: int = Field(foreign_key="category.id", primary_key=True)


class ProductIngredient(SQLModel, table=True):
    __tablename__ = "productoingrediente"
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    ingrediente_id: int = Field(foreign_key="ingrediente.id", primary_key=True)
    es_removible: bool = Field(default=False)
