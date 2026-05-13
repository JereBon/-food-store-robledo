import pytest
from decimal import Decimal
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.modules.productos.model import Product
from app.modules.productos.repository import ProductRepository
from app.modules.productos.service import ProductService
from app.modules.productos.schemas import ProductCreate, ProductUpdate
from app.modules.categorias.model import Category
from app.modules.ingredientes.model import Ingrediente


@pytest.fixture
def engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
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


class TestCreateProduct:
    def test_create_product_basic(self, service, repo, session):
        data = ProductCreate(
            name="Apple",
            description="Fresh red apple",
            price=Decimal("1.50"),
            stock=100,
        )
        product = service.create(data)
        session.commit()

        assert product.name == "Apple"
        assert product.price == Decimal("1.50")
        assert product.stock == 100
        assert product.disponible is True
        assert product.deleted_at is None

    def test_create_product_with_categories(self, service, repo, session):
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        data = ProductCreate(
            name="Apple",
            price=Decimal("1.50"),
            stock=50,
            category_ids=[cat.id],
        )
        product = service.create(data)
        session.commit()
        session.refresh(product)

        assert len(product.categories) == 1
        assert product.categories[0].name == "Fruits"

    def test_create_product_invalid_category(self, service):
        data = ProductCreate(
            name="Apple",
            price=Decimal("1.50"),
            stock=10,
            category_ids=[999],
        )
        with pytest.raises(ValueError, match="categories not found"):
            service.create(data)

    def test_create_product_with_disponible_false(self, service, repo, session):
        data = ProductCreate(
            name="Unavailable Item",
            price=Decimal("5.00"),
            stock=0,
            disponible=False,
        )
        product = service.create(data)
        session.commit()
        assert product.disponible is False


class TestUpdateProduct:
    def test_update_product_name_and_price(self, service, repo, session):
        prod = Product(name="Old", price=Decimal("1.00"), stock=10)
        session.add(prod)
        session.commit()
        session.refresh(prod)

        data = ProductUpdate(name="New Name", price=Decimal("2.50"))
        updated = service.update(prod, data)
        session.commit()

        assert updated.name == "New Name"
        assert updated.price == Decimal("2.50")

    def test_update_product_categories(self, service, repo, session):
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Organic", slug="organic")
        session.add(cat1)
        session.add(cat2)
        session.commit()
        session.refresh(cat1)
        session.refresh(cat2)

        prod = Product(name="Apple", price=Decimal("1.00"), stock=10)
        session.add(prod)
        session.commit()
        session.refresh(prod)

        data = ProductUpdate(category_ids=[cat1.id, cat2.id])
        updated = service.update(prod, data)
        session.commit()
        session.refresh(updated)

        assert len(updated.categories) == 2

    def test_update_product_clear_categories(self, service, repo, session):
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        prod = Product(name="Apple", price=Decimal("1.00"), stock=10)
        session.add(prod)
        session.commit()
        session.refresh(prod)

        data = ProductUpdate(category_ids=[])
        updated = service.update(prod, data)
        session.commit()
        session.refresh(updated)

        assert len(updated.categories) == 0

    def test_update_stock(self, service, repo, session):
        prod = Product(name="Apple", price=Decimal("1.00"), stock=10)
        session.add(prod)
        session.commit()
        session.refresh(prod)

        updated = service.update_stock(prod, 50)
        session.commit()
        assert updated.stock == 50

    def test_update_stock_negative_raises_error(self, service, repo, session):
        prod = Product(name="Apple", price=Decimal("1.00"), stock=10)
        session.add(prod)
        session.commit()
        session.refresh(prod)

        with pytest.raises(ValueError, match="negative"):
            service.update_stock(prod, -1)


class TestSoftDeleteProduct:
    def test_soft_delete_product(self, repo, session, service):
        prod = Product(name="Apple", price=Decimal("1.00"), stock=10)
        repo.create(prod)
        session.commit()
        session.refresh(prod)

        repo.soft_delete(prod)
        session.commit()

        fetched = repo.get_by_id(prod.id)
        assert fetched.deleted_at is not None

    def test_list_excludes_deleted(self, repo, session):
        p1 = Product(name="Available", price=Decimal("1.00"), stock=10)
        p2 = Product(name="Deleted", price=Decimal("2.00"), stock=5)
        session.add(p1)
        session.add(p2)
        session.commit()
        session.refresh(p2)

        repo.soft_delete(p2)
        session.commit()

        products, total = repo.list_filtered()
        assert total == 1
        assert products[0].name == "Available"
