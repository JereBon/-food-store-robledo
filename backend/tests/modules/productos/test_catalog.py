import pytest
from decimal import Decimal
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.modules.productos.model import Product, ProductCategory
from app.modules.productos.repository import ProductRepository
from app.modules.categorias.model import Category


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


class TestCatalogPagination:
    def test_list_filtered_pagination(self, repo, session):
        for i in range(25):
            session.add(Product(name=f"Product {i}", price=Decimal("1.00"), stock=10))
        session.commit()

        page1, total = repo.list_filtered(skip=0, limit=20)
        assert len(page1) == 20
        assert total == 25

        page2, total2 = repo.list_filtered(skip=20, limit=20)
        assert len(page2) == 5
        assert total2 == 25


class TestCatalogFilters:
    def test_filter_by_category(self, repo, session):
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        p1 = Product(name="Apple", price=Decimal("1.00"), stock=10)
        p2 = Product(name="Banana", price=Decimal("2.00"), stock=5)
        session.add(p1)
        session.add(p2)
        session.commit()
        session.refresh(p1)
        session.refresh(p2)

        session.add(ProductCategory(product_id=p1.id, category_id=cat.id))
        session.commit()

        products, total = repo.list_filtered(category_id=cat.id)
        assert total == 1
        assert products[0].name == "Apple"

    def test_search_by_name(self, repo, session):
        session.add(Product(name="Pizza Margherita", price=Decimal("10.00"), stock=5))
        session.add(Product(name="Pizza Pepperoni", price=Decimal("12.00"), stock=3))
        session.add(Product(name="Burger", price=Decimal("8.00"), stock=10))
        session.commit()

        results, total = repo.list_filtered(search="pizza")
        assert total == 2
        assert all("pizza" in r.name.lower() for r in results)

    def test_only_available(self, repo, session):
        session.add(Product(name="Available", price=Decimal("1.00"), stock=10, disponible=True))
        session.add(Product(name="Unavailable", price=Decimal("2.00"), stock=0, disponible=False))
        session.commit()

        products, total = repo.list_filtered(only_available=True)
        assert total == 1
        assert products[0].name == "Available"

    def test_empty_category_returns_empty(self, repo, session):
        products, total = repo.list_filtered(category_id=99999)
        assert total == 0
        assert products == []
