"""
Tests for product-category association
"""

import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.db.models import Category
from app.modules.productos.model import Product
from app.modules.productos.repository import ProductRepository
from app.modules.productos.service import ProductService
from app.modules.productos.schemas import ProductCreate, ProductUpdate


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
    return ProductRepository(session)


@pytest.fixture
def service(repo):
    """Create service instance."""
    return ProductService(repo)


@pytest.fixture
def category(session):
    """Create a category for testing."""
    cat = Category(name="Fruits", slug="fruits")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


class TestProductCategoryAssociation:
    """Tests for associating products with categories"""

    def test_create_product_with_category(self, service, session, category):
        """Test: Can create product with category"""
        data = ProductCreate(
            name="Apple",
            price=1.50,
            stock=100,
            category_id=category.id,
        )
        prod = service.create(data)
        session.commit()

        assert prod.name == "Apple"
        assert prod.category_id == category.id

    def test_create_product_without_category(self, service, session):
        """Test: Can create product without category (optional)"""
        data = ProductCreate(
            name="Apple",
            price=1.50,
            stock=100,
        )
        prod = service.create(data)
        session.commit()

        assert prod.category_id is None

    def test_create_with_invalid_category_fails(self, service, session):
        """Test: Creating product with invalid category raises error"""
        data = ProductCreate(
            name="Apple",
            price=1.50,
            category_id=99999,
        )
        with pytest.raises(ValueError, match="Category .* not found"):
            service.create(data)

    def test_update_product_category(self, service, repo, session, category):
        """Test: Can update product's category"""
        # Create product without category
        prod = Product(name="Apple", price=1.50)
        repo.create(prod)
        session.commit()
        session.refresh(prod)

        # Update with category
        data = ProductUpdate(category_id=category.id)
        updated = service.update(prod, data)
        session.commit()

        assert updated.category_id == category.id

    def test_remove_category_from_product(self, service, repo, session, category):
        """Test: Can remove category from product (set to null)"""
        # Create product with category
        prod = Product(name="Apple", price=1.50, category_id=category.id)
        repo.create(prod)
        session.commit()
        session.refresh(prod)

        # Remove category
        data = ProductUpdate(category_id=None)
        updated = service.update(prod, data)
        session.commit()

        assert updated.category_id is None


class TestProductCategoryFiltering:
    """Tests for filtering products by category"""

    def test_filter_products_by_category(self, repo, session, category):
        """Test: Can filter products by category_id"""
        # Create products
        prod1 = Product(name="Apple", price=1.50, category_id=category.id)
        prod2 = Product(name="Banana", price=0.50, category_id=category.id)
        prod3 = Product(name="Carrot", price=0.75)  # No category
        session.add_all([prod1, prod2, prod3])
        session.commit()

        # Filter by category
        products = repo.read_all(category_id=category.id)
        assert len(products) == 2
        assert all(p.category_id == category.id for p in products)

    def test_filter_empty_category_returns_empty(self, repo, session, category):
        """Test: Filtering by empty category returns empty list"""
        # Create product without this category
        prod = Product(name="Apple", price=1.50)
        session.add(prod)
        session.commit()

        # Filter by our category
        products = repo.read_all(category_id=category.id)
        assert len(products) == 0


class TestCategoryProductConstraint:
    """Tests for category-product constraints"""

    def test_delete_category_with_products_fails(self, service, repo, session, category):
        """Test: Cannot delete category that has products"""
        # Create product in category
        prod = Product(name="Apple", price=1.50, category_id=category.id)
        session.add(prod)
        session.commit()

        # Try to delete category
        with pytest.raises(ValueError, match="Cannot delete"):
            service.delete_with_validation(category)

    def test_product_without_category_not_affected_by_deletion(
        self, repo, session
    ):
        """Test: Products without category are not affected"""
        # Create product without category
        prod = Product(name="Apple", price=1.50)
        repo.create(prod)
        session.commit()

        # Should not raise error
        assert prod.category_id is None
