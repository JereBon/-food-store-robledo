from typing import Any, Optional
from datetime import datetime

from sqlmodel import Session, select, func

from app.modules.categorias.model import Category
from app.modules.productos.model import Product
from app.modules.productos.pivot import ProductCategory


class CategoryRepository:
    """Repository for Category data access."""

    def __init__(self, session: Session):
        self.session = session

    def create(self, category: Category) -> Category:
        """Create a new category."""
        self.session.add(category)
        return category

    def read(self, category: Category) -> Category:
        """Read/refresh an existing category."""
        self.session.refresh(category)
        return category

    def read_all(self, include_deleted: bool = False) -> list[Category]:
        """Read all categories. By default excludes soft-deleted categories."""
        query = select(Category)
        if not include_deleted:
            query = query.where(Category.deleted_at.is_(None))
        return list(self.session.exec(query).all())

    def read_all_paginated(
        self, skip: int = 0, limit: int = 20, include_deleted: bool = False
    ) -> tuple[list[Category], int]:
        """Read categories with pagination. Returns (items, total)."""
        base = select(Category)
        if not include_deleted:
            base = base.where(Category.deleted_at.is_(None))

        count_stmt = select(func.count()).select_from(base.subquery())
        total = self.session.exec(count_stmt).one()

        query = base.offset(skip).limit(limit).order_by(Category.name)
        items = list(self.session.exec(query).all())
        return items, total

    def get_by_id(self, category_id: int, include_deleted: bool = False) -> Optional[Category]:
        """Get category by ID."""
        query = select(Category).where(Category.id == category_id)
        if not include_deleted:
            query = query.where(Category.deleted_at.is_(None))
        return self.session.exec(query).first()

    def get_by_slug(self, slug: str, include_deleted: bool = False) -> Optional[Category]:
        """Get category by slug."""
        query = select(Category).where(Category.slug == slug)
        if not include_deleted:
            query = query.where(Category.deleted_at.is_(None))
        return self.session.exec(query).first()

    def get_by_name(self, name: str, exclude_id: Optional[int] = None) -> Optional[Category]:
        """Get category by name. Optionally exclude a specific ID (for update validation)."""
        query = select(Category).where(
            Category.name == name,
            Category.deleted_at.is_(None)
        )
        if exclude_id:
            query = query.where(Category.id != exclude_id)
        return self.session.exec(query).first()

    def update(self, category: Category) -> Category:
        """Update an existing category."""
        category.updated_at = datetime.utcnow()
        self.session.add(category)
        return category

    def delete_soft(self, category: Category) -> Category:
        """Soft delete a category (set deleted_at)."""
        category.deleted_at = datetime.utcnow()
        category.updated_at = datetime.utcnow()
        self.session.add(category)
        return category

    def restore(self, category: Category) -> Category:
        """Restore a soft-deleted category."""
        category.deleted_at = None
        category.updated_at = datetime.utcnow()
        self.session.add(category)
        return category

    def check_has_products(self, category_id: int) -> bool:
        """Check if category has any active (non-deleted) products."""
        query = (
            select(Product)
            .join(ProductCategory, Product.id == ProductCategory.product_id)
            .where(
                ProductCategory.category_id == category_id,
                Product.deleted_at.is_(None),
            )
        )
        return self.session.exec(query).first() is not None
