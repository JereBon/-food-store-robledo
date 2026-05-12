from typing import Optional

from app.modules.productos.model import Product
from app.modules.productos.repository import ProductRepository
from app.modules.productos.schemas import ProductCreate, ProductUpdate


class ProductService:
    """Business logic for products."""

    def __init__(self, repository: ProductRepository):
        self.repository = repository

    def create(self, data: ProductCreate) -> Product:
        """Create a new product with validation."""
        # Validate category exists if provided
        if data.category_id is not None:
            if not self.repository.validate_category_exists(data.category_id):
                raise ValueError(f"Category with ID {data.category_id} not found or is deleted")

        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            category_id=data.category_id,
        )
        return self.repository.create(product)

    def update(self, product: Product, data: ProductUpdate) -> Product:
        """Update an existing product with validation."""
        # Validate category exists if provided and changed
        if data.category_id is not None and data.category_id != product.category_id:
            if not self.repository.validate_category_exists(data.category_id):
                raise ValueError(f"Category with ID {data.category_id} not found or is deleted")

        if data.name is not None:
            product.name = data.name
        if data.description is not None:
            product.description = data.description
        if data.price is not None:
            product.price = data.price
        if data.stock is not None:
            product.stock = data.stock
        if data.category_id is not None or (data.category_id is None and hasattr(data, 'category_id')):
            # Allow explicit None to remove category association
            product.category_id = data.category_id

        return self.repository.update(product)

    def associate_category(self, product: Product, category_id: Optional[int]) -> Product:
        """Associate or disassociate a product from a category."""
        if category_id is not None:
            if not self.repository.validate_category_exists(category_id):
                raise ValueError(f"Category with ID {category_id} not found or is deleted")

        product.category_id = category_id
        return self.repository.update(product)
