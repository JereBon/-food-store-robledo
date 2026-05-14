"""Tests for direcciones router"""
import pytest
from fastapi.testclient import TestClient

from app.core.database import get_session
from app.core.security import create_access_token, hash_password
from app.db.models import Role, User
from app.main import app


def _token(user_id: int) -> str:
    return create_access_token(subject=str(user_id), roles=[])


@pytest.fixture
def client(session, sqlite_engine):
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def auth_user(session):
    session.add(Role(id=4, code="CLIENT", name="Cliente"))
    session.commit()
    user = User(email="user@test.com", password_hash=hash_password("pass"), nombre="Test", apellido="User")
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"user": user, "token": _token(user.id)}


def _h(token):
    return {"Authorization": f"Bearer {token}"}


PAYLOAD = {"calle": "Av. Principal", "numero": "100", "ciudad": "Buenos Aires"}


def test_create_direccion(client, auth_user):
    resp = client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    assert resp.status_code == 201
    data = resp.json()
    assert data["calle"] == "Av. Principal"
    assert data["es_predeterminada"] is True


def test_first_address_is_default(client, auth_user):
    resp = client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    assert resp.json()["es_predeterminada"] is True


def test_second_address_not_default(client, auth_user):
    client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    resp2 = client.post("/api/v1/direcciones", json={**PAYLOAD, "calle": "Calle Dos"}, headers=_h(auth_user["token"]))
    assert resp2.json()["es_predeterminada"] is False


def test_list_direcciones(client, auth_user):
    client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    resp = client.get("/api/v1/direcciones", headers=_h(auth_user["token"]))
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_update_direccion(client, auth_user):
    create_resp = client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    did = create_resp.json()["id"]
    resp = client.patch(f"/api/v1/direcciones/{did}", json={"calle": "Nueva Calle"}, headers=_h(auth_user["token"]))
    assert resp.status_code == 200
    assert resp.json()["calle"] == "Nueva Calle"


def test_delete_direccion(client, auth_user):
    create_resp = client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    did = create_resp.json()["id"]
    resp = client.delete(f"/api/v1/direcciones/{did}", headers=_h(auth_user["token"]))
    assert resp.status_code == 204
    list_resp = client.get("/api/v1/direcciones", headers=_h(auth_user["token"]))
    assert len(list_resp.json()) == 0


def test_set_predeterminada(client, auth_user):
    client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    resp2 = client.post("/api/v1/direcciones", json={**PAYLOAD, "calle": "Calle B"}, headers=_h(auth_user["token"]))
    did2 = resp2.json()["id"]
    resp = client.patch(f"/api/v1/direcciones/{did2}/predeterminada", headers=_h(auth_user["token"]))
    assert resp.status_code == 200
    assert resp.json()["es_predeterminada"] is True

    list_resp = client.get("/api/v1/direcciones", headers=_h(auth_user["token"]))
    defaults = [d for d in list_resp.json() if d["es_predeterminada"]]
    assert len(defaults) == 1
    assert defaults[0]["id"] == did2


def test_ownership_returns_404_for_other_user(client, auth_user, session):
    user2 = User(email="other@test.com", password_hash=hash_password("x"), nombre="Other", apellido="U")
    session.add(user2)
    session.commit()
    session.refresh(user2)
    token2 = _token(user2.id)

    create_resp = client.post("/api/v1/direcciones", json=PAYLOAD, headers=_h(auth_user["token"]))
    did = create_resp.json()["id"]
    resp = client.patch(f"/api/v1/direcciones/{did}", json={"calle": "Hack"}, headers=_h(token2))
    assert resp.status_code == 404


def test_create_requires_auth(client):
    resp = client.post("/api/v1/direcciones", json=PAYLOAD)
    assert resp.status_code == 401
