"""
Tests for category router endpoints
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from datetime import datetime

import app.uow as uow_module
from app.main import app
from app.core.database import get_session
from app.db.models import User, Role, UserRole
from app.modules.categorias.model import Category
from app.core.security import hash_password, create_access_token


@pytest.fixture
def engine(monkeypatch):
    """Create in-memory SQLite database and patch UoW to use it."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    monkeypatch.setattr(uow_module, "default_engine", engine)
    return engine


@pytest.fixture
def session(engine):
    """Create a database session for tests."""
    with Session(engine) as session:
        yield session


@pytest.fixture
def client(session):
    """Create a test client with injected SQLite session."""
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(session):
    """Create an admin user for testing."""
    # Create role
    admin_role = Role(id=1, code="ADMIN", name="Administrator")
    session.add(admin_role)
    session.commit()

    # Create user
    user = User(
        email="admin@test.com",
        password_hash=hash_password("password"),
        nombre="Admin",
        apellido="User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Assign role
    user_role = UserRole(user_id=user.id, role_id=admin_role.id)
    session.add(user_role)
    session.commit()

    return user


@pytest.fixture
def regular_user(session):
    """Create a regular user for testing."""
    # Create role
    client_role = Role(id=4, code="CLIENT", name="Client")
    session.add(client_role)
    session.commit()

    # Create user
    user = User(
        email="user@test.com",
        password_hash=hash_password("password"),
        nombre="Regular",
        apellido="User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Assign role
    user_role = UserRole(user_id=user.id, role_id=client_role.id)
    session.add(user_role)
    session.commit()

    return user


@pytest.fixture
def admin_token(admin_user):
    """Generate JWT token for admin user."""
    return create_access_token(subject=str(admin_user.id), roles=["ADMIN"])


@pytest.fixture
def user_token(regular_user):
    """Generate JWT token for regular user."""
    return create_access_token(subject=str(regular_user.id), roles=["CLIENT"])


class TestCategoryCreate:
    """Tests for POST /categories"""

    def test_admin_can_create_category(self, client, admin_token):
        """Test: Admin can create a new category"""
        response = client.post(
            "/api/v1/categories",
            json={"name": "Fruits", "description": "Fresh fruits"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Fruits"
        assert data["slug"] == "fruits"
        assert data["description"] == "Fresh fruits"

    def test_non_admin_cannot_create_category(self, client, user_token):
        """Test: Regular user cannot create category (403 Forbidden)"""
        response = client.post(
            "/api/v1/categories",
            json={"name": "Fruits"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 403

    def test_duplicate_name_rejected(self, client, admin_token, session):
        """Test: Duplicate category name is rejected"""
        # Create first category
        client.post(
            "/api/v1/categories",
            json={"name": "Fruits"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Try to create duplicate
        response = client.post(
            "/api/v1/categories",
            json={"name": "Fruits"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestCategoryList:
    """Tests for GET /categories"""

    def test_list_categories(self, client, admin_token, session):
        """Test: Can list all categories"""
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Vegetables", slug="vegetables")
        session.add(cat1)
        session.add(cat2)
        session.commit()

        response = client.get(
            "/api/v1/categories",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert any(c["name"] == "Fruits" for c in data["items"])
        assert any(c["name"] == "Vegetables" for c in data["items"])

    def test_list_excludes_deleted_for_regular_users(self, client, user_token, session):
        """Test: Regular users don't see deleted categories"""
        cat1 = Category(name="Fruits", slug="fruits")
        cat2 = Category(name="Deleted", slug="deleted", deleted_at=datetime(2026, 5, 11))
        session.add(cat1)
        session.add(cat2)
        session.commit()

        response = client.get(
            "/api/v1/categories",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Fruits"


class TestCategoryGet:
    """Tests for GET /categories/{id}"""

    def test_get_category_by_id(self, client, session):
        """Test: Can get a category by ID"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        response = client.get(f"/api/v1/categories/{cat.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Fruits"
        assert data["id"] == cat.id

    def test_get_nonexistent_category(self, client):
        """Test: Getting non-existent category returns 404"""
        response = client.get("/api/v1/categories/99999")
        assert response.status_code == 404


class TestCategoryUpdate:
    """Tests for PUT /categories/{id}"""

    def test_admin_can_update_category(self, client, admin_token, session):
        """Test: Admin can update a category"""
        cat = Category(name="Fruits", slug="fruits", description="Old description")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        response = client.put(
            f"/api/v1/categories/{cat.id}",
            json={"name": "Vegetables", "description": "New description"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Vegetables"
        assert data["slug"] == "vegetables"
        assert data["description"] == "New description"

    def test_non_admin_cannot_update(self, client, user_token, session):
        """Test: Regular user cannot update category (403)"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        response = client.put(
            f"/api/v1/categories/{cat.id}",
            json={"name": "Vegetables"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 403


class TestCategoryDelete:
    """Tests for DELETE /categories/{id}"""

    def test_admin_can_delete_category(self, client, admin_token, session):
        """Test: Admin can soft-delete a category"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        response = client.delete(
            f"/api/v1/categories/{cat.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 204

        # Verify soft delete
        session.refresh(cat)
        assert cat.deleted_at is not None

    def test_non_admin_cannot_delete(self, client, user_token, session):
        """Test: Regular user cannot delete category (403)"""
        cat = Category(name="Fruits", slug="fruits")
        session.add(cat)
        session.commit()
        session.refresh(cat)

        response = client.delete(
            f"/api/v1/categories/{cat.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 403
