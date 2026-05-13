import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.modules.ingredientes.model import Ingrediente
from app.modules.ingredientes.repository import IngredienteRepository
from app.modules.ingredientes.service import IngredienteService
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate


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
    return IngredienteRepository(session)


@pytest.fixture
def service(repo):
    return IngredienteService(repo)


class TestCreateIngredient:
    def test_create_ingredient_basic(self, service, repo, session):
        data = IngredienteCreate(nombre="Tomato", es_alergeno=False)
        ing = service.create(data)
        session.commit()
        assert ing.nombre == "Tomato"
        assert ing.es_alergeno is False

    def test_create_allergen_ingredient(self, service, repo, session):
        data = IngredienteCreate(nombre="Peanuts", es_alergeno=True)
        ing = service.create(data)
        session.commit()
        assert ing.es_alergeno is True

    def test_create_duplicate_name_raises_error(self, service, repo, session):
        data = IngredienteCreate(nombre="Tomato")
        service.create(data)
        session.commit()
        with pytest.raises(ValueError, match="already exists"):
            service.create(data)

    def test_create_defaults_es_alergeno_false(self, service, repo, session):
        data = IngredienteCreate(nombre="Salt")
        ing = service.create(data)
        session.commit()
        assert ing.es_alergeno is False


class TestUpdateIngredient:
    def test_update_ingredient_name(self, service, repo, session):
        ing = Ingrediente(nombre="Tomato", es_alergeno=False)
        repo.create(ing)
        session.commit()
        session.refresh(ing)

        data = IngredienteUpdate(nombre="Fresh Tomato")
        updated = service.update(ing, data)
        session.commit()
        assert updated.nombre == "Fresh Tomato"

    def test_update_allergen_flag(self, service, repo, session):
        ing = Ingrediente(nombre="Soy", es_alergeno=False)
        repo.create(ing)
        session.commit()
        session.refresh(ing)

        data = IngredienteUpdate(es_alergeno=True)
        updated = service.update(ing, data)
        session.commit()
        assert updated.es_alergeno is True

    def test_update_duplicate_name_raises_error(self, service, repo, session):
        ing1 = Ingrediente(nombre="Tomato", es_alergeno=False)
        ing2 = Ingrediente(nombre="Onion", es_alergeno=False)
        repo.create(ing1)
        repo.create(ing2)
        session.commit()
        session.refresh(ing2)

        data = IngredienteUpdate(nombre="Tomato")
        with pytest.raises(ValueError, match="already exists"):
            service.update(ing2, data)


class TestSoftDeleteIngredient:
    def test_soft_delete(self, repo, session):
        ing = Ingrediente(nombre="Tomato", es_alergeno=False)
        repo.create(ing)
        session.commit()
        session.refresh(ing)

        repo.soft_delete(ing)
        session.commit()
        assert ing.deleted_at is not None

    def test_list_excludes_deleted(self, repo, session):
        repo.create(Ingrediente(nombre="Active", es_alergeno=False))
        ing2 = Ingrediente(nombre="Deleted", es_alergeno=False)
        repo.create(ing2)
        session.commit()
        session.refresh(ing2)

        repo.soft_delete(ing2)
        session.commit()

        all_ing = repo.list_all()
        active = [i for i in all_ing if i.deleted_at is None]
        assert len(active) == 1
        assert active[0].nombre == "Active"


class TestListIngredients:
    def test_list_all(self, repo, session):
        repo.create(Ingrediente(nombre="Tomato", es_alergeno=False))
        repo.create(Ingrediente(nombre="Cheese", es_alergeno=False))
        session.commit()
        results = repo.list_all()
        assert len(results) == 2
