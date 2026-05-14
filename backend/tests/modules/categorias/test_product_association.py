"""
Tests for product-category association (M2M via ProductCategory pivot)
"""

from decimal import Decimal

import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.modules.categorias.model import Category
from app.modules.categorias.repository import CategoryRepository
from app.modules.categorias.service import CategoryService
from app.modules.productos.model import Product
from app.modules.productos.pivot import ProductCategory
from app.modules.productos.repository import ProductRepository
from app.modules.productos.service import ProductService
from app.modules.productos.schemas import ProductCreate, ProductUpdate


@pytest.fixture
def engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture
def repo(session):
    return ProductRepository(session)


@pytest.fixture
def service(repo):
    return ProductService(repo)


@pytest.fixture
def cat_service(session):
    repo = CategoryRepository(session)
    return CategoryService(repo)


@pytest.fixture
def category(session):
    cat = Category(name="Fruits", slug="fruits")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


class TestProductCategoryAssociation:
    """Tests for associating products with categories via M2M"""

    def test_create_product_with_category(self, service, session, category):
        """Test: Can create product linked to a category"""
        data = ProductCreate(
            name="Apple",
            price=Decimal("1.50"),
            stock=100,
            category_ids=[category.id],
        )
        prod = service.create(data)
        session.commit()
        session.refresh(prod)

        assert prod.name == "Apple"
        assert len(prod.categories) == 1
        assert prod.categories[0].id == category.id

    def test_create_product_without_category(self, service, session):
        """Test: Can create product without any category (optional)"""
        data = ProductCreate(
            name="Plain Item",
            price=Decimal("1.50"),
            stock=100,
        )
        prod = service.create(data)
        session.commit()
        session.refresh(prod)

        assert len(prod.categories) == 0

    def test_create_with_invalid_category_fails(self, service):
        """Test: Creating product with non-existent category raises ValueError"""
        data = ProductCreate(
            name="Apple",
            price=Decimal("1.50"),
            category_ids=[99999],
        )
        with pytest.raises(ValueError, match="categories not found"):
            service.create(data)

    def test_update_product_category(self, service, repo, session, category):
        """Test: Can assign a category to a product via update"""
        prod = Product(name="Apple", price=Decimal("1.50"))
        repo.create(prod)
        session.commit()
        session.refresh(prod)

        data = ProductUpdate(category_ids=[category.id])
        updated = service.update(prod, data)
        session.commit()
        session.refresh(updated)

        assert len(updated.categories) == 1
        assert updated.categories[0].id == category.id

    def test_remove_category_from_product(self, service, repo, session, category):
        """Test: Can remove all categories from a product"""
        prod = Product(name="Apple", price=Decimal("1.50"))
        repo.create(prod)
        session.flush()
        session.add(ProductCategory(product_id=prod.id, category_id=category.id))
        session.commit()
        session.refresh(prod)

        data = ProductUpdate(category_ids=[])
        updated = service.update(prod, data)
        session.commit()
        session.refresh(updated)

        assert len(updated.categories) == 0


class TestProductCategoryFiltering:
    """Tests for filtering products by category"""

    def test_filter_products_by_category(self, repo, session, category):
        """Test: Can filter products by category_id"""
        prod1 = Product(name="Apple", price=Decimal("1.50"))
        prod2 = Product(name="Banana", price=Decimal("0.50"))
        prod3 = Product(name="Carrot", price=Decimal("0.75"))
        session.add_all([prod1, prod2, prod3])
        session.flush()
        session.add(ProductCategory(product_id=prod1.id, category_id=category.id))
        session.add(ProductCategory(product_id=prod2.id, category_id=category.id))
        session.commit()

        products, total = repo.list_filtered(category_id=category.id)
        assert total == 2
        names = {p.name for p in products}
        assert names == {"Apple", "Banana"}

    def test_filter_empty_category_returns_empty(self, repo, session, category):
        """Test: Filtering by a category with no products returns empty list"""
        prod = Product(name="Apple", price=Decimal("1.50"))
        session.add(prod)
        session.commit()

        products, total = repo.list_filtered(category_id=category.id)
        assert total == 0
        assert products == []


class TestCategoryProductConstraint:
    """Tests for category-product delete constraints"""

    def test_delete_category_with_products_fails(self, cat_service, repo, session, category):
        """Test: Cannot delete category that has active products"""
        prod = Product(name="Apple", price=Decimal("1.50"))
        session.add(prod)
        session.flush()
        session.add(ProductCategory(product_id=prod.id, category_id=category.id))
        session.commit()

        with pytest.raises(ValueError, match="Cannot delete"):
            cat_service.delete_with_validation(category)

    def test_product_without_category_not_affected_by_deletion(self, repo, session):
        """Test: Products without any category have empty categories list"""
        prod = Product(name="Apple", price=Decimal("1.50"))
        repo.create(prod)
        session.commit()
        session.refresh(prod)

        assert len(prod.categories) == 0
