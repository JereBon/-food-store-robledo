from decimal import Decimal
from typing import Optional

from app.modules.productos.model import Product
from app.modules.productos.repository import ProductRepository
from app.modules.productos.schemas import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, repository: ProductRepository):
        self.repository = repository

    def create(self, data: ProductCreate) -> Product:
        if data.category_ids:
            if not self.repository.validate_categories_exist(data.category_ids):
                raise ValueError("One or more categories not found or deleted")

        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            disponible=data.disponible,
            imagen_url=data.imagen_url,
        )
        created = self.repository.create(product)
        self.repository.session.flush()  # get product.id before M2M inserts
        if data.category_ids:
            self.repository.set_categories(created.id, data.category_ids)
        return created

    def update(self, product: Product, data: ProductUpdate) -> Product:
        update_dict = data.model_dump(exclude_unset=True)

        if "category_ids" in update_dict:
            cat_ids = update_dict.pop("category_ids")
            if not self.repository.validate_categories_exist(cat_ids):
                raise ValueError("One or more categories not found or deleted")
            self.repository.set_categories(product.id, cat_ids)

        return self.repository.update(product, update_dict)

    def update_stock(self, product: Product, cantidad: int) -> Product:
        if cantidad < 0:
            raise ValueError("Stock cannot be negative")
        return self.repository.update(product, {"stock": cantidad})
