import re
from typing import Optional
from datetime import datetime

from app.modules.categorias.model import Category
from app.modules.categorias.repository import CategoryRepository
from app.modules.categorias.schemas import CategoryCreate, CategoryUpdate


class CategoryService:
    """Business logic for categories."""

    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    @staticmethod
    def generate_slug(name: str) -> str:
        """Generate a URL-safe slug from a category name."""
        # Convert to lowercase and replace spaces with hyphens
        slug = name.lower().strip()
        # Replace spaces with hyphens
        slug = re.sub(r'\s+', '-', slug)
        # Remove any characters that aren't alphanumeric, hyphens, or underscores
        slug = re.sub(r'[^a-z0-9\-_]', '', slug)
        # Replace multiple hyphens with single hyphen
        slug = re.sub(r'-+', '-', slug)
        # Strip hyphens from beginning and end
        slug = slug.strip('-')
        return slug

    @staticmethod
    def _handle_slug_conflict(base_slug: str, repository: CategoryRepository) -> str:
        """Handle slug conflicts by appending a numeric suffix."""
        existing = repository.get_by_slug(base_slug, include_deleted=False)
        if not existing:
            return base_slug

        counter = 1
        while True:
            new_slug = f"{base_slug}-{counter}"
            existing = repository.get_by_slug(new_slug, include_deleted=False)
            if not existing:
                return new_slug
            counter += 1

    def validate_unique_name(self, name: str, exclude_id: Optional[int] = None) -> bool:
        """Check if a category name is unique. Returns True if unique, False if already exists."""
        existing = self.repository.get_by_name(name, exclude_id=exclude_id)
        return existing is None

    def create(self, data: CategoryCreate) -> Category:
        """Create a new category with validation."""
        # Validate unique name
        if not self.validate_unique_name(data.name):
            raise ValueError(f"Category with name '{data.name}' already exists")

        # Generate slug
        base_slug = self.generate_slug(data.name)
        slug = self._handle_slug_conflict(base_slug, self.repository)

        # Create category
        category = Category(
            name=data.name,
            slug=slug,
            description=data.description,
        )
        return self.repository.create(category)

    def update(self, category: Category, data: CategoryUpdate) -> Category:
        """Update an existing category with validation."""
        if data.name:
            # Validate unique name (excluding current category)
            if not self.validate_unique_name(data.name, exclude_id=category.id):
                raise ValueError(f"Category with name '{data.name}' already exists")
            category.name = data.name
            # Regenerate slug when name changes
            base_slug = self.generate_slug(data.name)
            category.slug = self._handle_slug_conflict(base_slug, self.repository)

        if data.description is not None:
            category.description = data.description

        return self.repository.update(category)

    def delete_with_validation(self, category: Category) -> Category:
        """Delete category with validation (prevent delete if has products)."""
        if self.repository.check_has_products(category.id):
            raise ValueError("Cannot delete category that has active products")
        return self.repository.delete_soft(category)
