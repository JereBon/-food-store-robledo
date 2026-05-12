"""
Tests for category deletion and soft delete behavior
"""

import pytest
from datetime import datetime
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.db.models import Category
from app.modules.productos.model import Product
from app.modules.categorias.repository import CategoryRepository


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


class TestCategoryDeletion:
    """Tests for category deletion logic"""

    def test_check_has_products_returns_true_for_products(self, repo, session):
        """Test: check_has_products returns True when products exist"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        # Add product
        prod = Product(name="Apple", price=1.50, category_id=cat.id)
        session.add(prod)
        session.commit()

        # Check
        result = repo.check_has_products(cat.id)
        assert result is True

    def test_check_has_products_returns_false_for_empty(self, repo, session):
        """Test: check_has_products returns False for empty category"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        # Check
        result = repo.check_has_products(cat.id)
        assert result is False

    def test_check_has_products_ignores_deleted_products(self, repo, session):
        """Test: check_has_products ignores soft-deleted products"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        # Add deleted product
        prod = Product(
            name="Apple",
            price=1.50,
            category_id=cat.id,
            deleted_at=datetime.utcnow(),
        )
        session.add(prod)
        session.commit()

        # Check - should return False since product is deleted
        result = repo.check_has_products(cat.id)
        assert result is False


class TestCategorySoftDelete:
    """Tests for soft delete behavior"""

    def test_soft_delete_sets_deleted_at(self, repo, session):
        """Test: Soft delete sets deleted_at timestamp"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        before = datetime.utcnow()
        deleted = repo.delete_soft(cat)
        after = datetime.utcnow()

        assert deleted.deleted_at is not None
        assert before <= deleted.deleted_at <= after

    def test_soft_delete_updates_updated_at(self, repo, session):
        """Test: Soft delete also updates updated_at"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        original_updated = cat.updated_at
        deleted = repo.delete_soft(cat)

        assert deleted.updated_at >= original_updated

    def test_read_all_excludes_deleted_by_default(self, repo, session):
        """Test: read_all excludes soft-deleted categories by default"""
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Vegetables", slug="vegetables", deleted_at=datetime.utcnow())
        session.add(cat1)
        session.add(cat2)
        session.commit()

        # Read without deleted
        cats = repo.read_all(include_deleted=False)
        assert len(cats) == 1
        assert cats[0].name == "Fruits"

    def test_read_all_includes_deleted_when_requested(self, repo, session):
        """Test: read_all includes soft-deleted when requested"""
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Vegetables", slug="vegetables", deleted_at=datetime.utcnow())
        session.add(cat1)
        session.add(cat2)
        session.commit()

        # Read with deleted
        cats = repo.read_all(include_deleted=True)
        assert len(cats) == 2

    def test_get_by_id_excludes_deleted_by_default(self, repo, session):
        """Test: get_by_id excludes soft-deleted categories"""
        cat = Category(name="Fruits", slug="fruits", deleted_at=datetime.utcnow())
        session.add(cat)
        session.commit()
        session.refresh(cat)

        # Try to get deleted category
        result = repo.get_by_id(cat.id, include_deleted=False)
        assert result is None

    def test_get_by_id_includes_deleted_when_requested(self, repo, session):
        """Test: get_by_id includes deleted when requested"""
        cat = Category(name="Fruits", slug="fruits", deleted_at=datetime.utcnow())
        session.add(cat)
        session.commit()
        session.refresh(cat)

        # Get with deleted
        result = repo.get_by_id(cat.id, include_deleted=True)
        assert result is not None
        assert result.name == "Fruits"

    def test_get_by_slug_respects_deleted(self, repo, session):
        """Test: get_by_slug respects soft delete"""
        cat = Category(name="Fruits", slug="fruits", deleted_at=datetime.utcnow())
        session.add(cat)
        session.commit()

        # Get without deleted
        result = repo.get_by_slug("fruits", include_deleted=False)
        assert result is None

        # Get with deleted
        result = repo.get_by_slug("fruits", include_deleted=True)
        assert result is not None
