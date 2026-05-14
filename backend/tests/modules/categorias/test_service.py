"""
Tests for category service
"""

import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.modules.categorias.model import Category
from app.modules.categorias.repository import CategoryRepository
from app.modules.categorias.service import CategoryService
from app.modules.categorias.schemas import CategoryCreate, CategoryUpdate


@pytest.fixture
def engine():
    """Create in-memory SQLite database for tests."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    from app.db.models import SQLModel

    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def session(engine):
    """Create a database session for tests."""
    with Session(engine) as session:
        yield session


@pytest.fixture
def repo(session):
    """Create repository instance."""
    return CategoryRepository(session)


@pytest.fixture
def service(repo):
    """Create service instance."""
    return CategoryService(repo)


class TestSlugGeneration:
    """Tests for slug generation"""

    def test_slug_generated_from_name(self, service):
        """Test: Slug is generated correctly from name"""
        slug = service.generate_slug("Fruits and Vegetables")
        assert slug == "fruits-and-vegetables"

    def test_slug_handles_special_characters(self, service):
        """Test: Slug removes special characters"""
        slug = service.generate_slug("Café @ Home!")
        assert slug == "caf-home"

    def test_slug_handles_multiple_spaces(self, service):
        """Test: Slug collapses multiple spaces"""
        slug = service.generate_slug("Fresh   Organic   Fruits")
        assert slug == "fresh-organic-fruits"


class TestValidateUniqueName:
    """Tests for name uniqueness validation"""

    def test_unique_name_returns_true(self, service):
        """Test: Unique name returns True"""
        result = service.validate_unique_name("NewCategory")
        assert result is True

    def test_duplicate_name_returns_false(self, service, repo, session):
        """Test: Duplicate name returns False"""
        # Create category
        cat = Category(name="Fruits", slug="fruits")
        repo.create(cat)
        session.commit()

        # Check duplicate
        result = service.validate_unique_name("Fruits")
        assert result is False

    def test_exclude_id_allows_same_name(self, service, repo, session):
        """Test: exclude_id allows updating with same name"""
        # Create category
        cat = Category(name="Fruits", slug="fruits")
        repo.create(cat)
        session.commit()
        session.refresh(cat)

        # Check with exclude_id (same category can keep its name)
        result = service.validate_unique_name("Fruits", exclude_id=cat.id)
        assert result is True


class TestCreateCategory:
    """Tests for creating categories"""

    def test_create_category_success(self, service, repo, session):
        """Test: Can create a category"""
        data = CategoryCreate(name="Fruits", description="Fresh fruits")
        cat = service.create(data)
        session.commit()

        assert cat.name == "Fruits"
        assert cat.slug == "fruits"
        assert cat.description == "Fresh fruits"

    def test_create_duplicate_raises_error(self, service, repo, session):
        """Test: Creating duplicate name raises ValueError"""
        # Create first
        data1 = CategoryCreate(name="Fruits")
        service.create(data1)
        session.commit()

        # Try to create duplicate
        data2 = CategoryCreate(name="Fruits")
        with pytest.raises(ValueError, match="already exists"):
            service.create(data2)

    def test_create_handles_slug_conflict(self, service, repo, session):
        """Test: Slug conflict is handled with numeric suffix"""
        # Create first category
        data1 = CategoryCreate(name="Fruits")
        cat1 = service.create(data1)
        session.commit()
        assert cat1.slug == "fruits"

        # Create another that would have same slug
        data2 = CategoryCreate(name="FRUITS")  # Should generate 'fruits' too
        cat2 = service.create(data2)
        session.commit()

        # Second should have numeric suffix
        assert cat2.slug == "fruits-1"


class TestUpdateCategory:
    """Tests for updating categories"""

    def test_update_category_success(self, service, repo, session):
        """Test: Can update a category"""
        cat = Category(name="Fruits", slug="fruits")
        repo.create(cat)
        session.commit()
        session.refresh(cat)

        data = CategoryUpdate(name="Vegetables", description="Green veggies")
        updated = service.update(cat, data)
        session.commit()

        assert updated.name == "Vegetables"
        assert updated.slug == "vegetables"
        assert updated.description == "Green veggies"

    def test_update_with_duplicate_name_raises_error(self, service, repo, session):
        """Test: Update to duplicate name raises ValueError"""
        # Create two categories
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Vegetables", slug="vegetables")
        repo.create(cat1)
        repo.create(cat2)
        session.commit()
        session.refresh(cat1)
        session.refresh(cat2)

        # Try to update cat2 to same name as cat1
        data = CategoryUpdate(name="Fruits")
        with pytest.raises(ValueError, match="already exists"):
            service.update(cat2, data)

    def test_update_partial_fields(self, service, repo, session):
        """Test: Update only some fields"""
        cat = Category(name="Fruits", slug="fruits", description="Old")
        repo.create(cat)
        session.commit()
        session.refresh(cat)

        # Update only description
        data = CategoryUpdate(description="New description")
        updated = service.update(cat, data)
        session.commit()

        assert updated.name == "Fruits"  # unchanged
        assert updated.description == "New description"


class TestDeleteCategory:
    """Tests for deleting categories"""

    def test_delete_empty_category_success(self, service, repo, session):
        """Test: Can delete category with no products"""
        cat = Category(name="Fruits", slug="fruits")
        repo.create(cat)
        session.commit()
        session.refresh(cat)

        deleted = service.delete_with_validation(cat)
        session.commit()

        assert deleted.deleted_at is not None

    def test_delete_category_with_products_fails(self, service, repo, session):
        """Test: Cannot delete category that has active products"""
        from app.modules.productos.model import Product
        from app.modules.productos.pivot import ProductCategory

        cat = Category(name="Fruits", slug="fruits")
        repo.create(cat)
        session.commit()
        session.refresh(cat)

        prod = Product(name="Apple", price=1.50)
        session.add(prod)
        session.flush()
        session.add(ProductCategory(product_id=prod.id, category_id=cat.id))
        session.commit()

        with pytest.raises(ValueError, match="Cannot delete"):
            service.delete_with_validation(cat)
