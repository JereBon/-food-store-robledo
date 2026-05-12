from typing import Optional, List
from datetime import datetime

from sqlmodel import Session, select

from app.modules.productos.model import Product
from app.modules.categorias.model import Category


class ProductRepository:
    """Repository for Product data access."""

    def __init__(self, session: Session):
        self.session = session

    def create(self, product: Product) -> Product:
        """Create a new product."""
        self.session.add(product)
        return product

    def read(self, product: Product) -> Product:
        """Read/refresh an existing product."""
        self.session.refresh(product)
        return product

    def read_all(self, include_deleted: bool = False, category_id: Optional[int] = None) -> List[Product]:
        """Read all products. By default excludes soft-deleted products."""
        query = select(Product)
        if not include_deleted:
            query = query.where(Product.deleted_at.is_(None))
        if category_id is not None:
            query = query.where(Product.category_id == category_id)
        return self.session.exec(query).all()

    def get_by_id(self, product_id: int, include_deleted: bool = False) -> Optional[Product]:
        """Get product by ID."""
        query = select(Product).where(Product.id == product_id)
        if not include_deleted:
            query = query.where(Product.deleted_at.is_(None))
        return self.session.exec(query).first()

    def update(self, product: Product) -> Product:
        """Update an existing product."""
        product.updated_at = datetime.utcnow()
        self.session.add(product)
        return product

    def delete_soft(self, product: Product) -> Product:
        """Soft delete a product (set deleted_at)."""
        product.deleted_at = datetime.utcnow()
        product.updated_at = datetime.utcnow()
        self.session.add(product)
        return product

    def validate_category_exists(self, category_id: int) -> bool:
        """Check if a category exists and is not deleted."""
        query = select(Category).where(
            Category.id == category_id,
            Category.deleted_at.is_(None)
        )
        result = self.session.exec(query).first()
        return result is not None
