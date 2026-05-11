from hashlib import sha256

import pytest
from fastapi import HTTPException
from sqlmodel import select

from app.core.security import verify_password
from app.db.models import RefreshToken, Role, User
from app.modules.auth.schemas import RegisterRequest
from app.modules.auth.service import register_user
from app.uow import UnitOfWork


@pytest.fixture
def client_role(session):
    existing = session.exec(select(Role).where(Role.code == "CLIENT")).first()
    if existing is not None:
        return existing
    role = Role(id=4, code="CLIENT", name="Cliente")
    session.add(role)
    session.commit()
    return role


def test_register_assigns_client_role_and_tokens(client_role, test_engine, session):
    request = RegisterRequest(
        nombre="Juan",
        apellido="Perez",
        email="juan@example.com",
        password="supersecreto",
        telefono="123456789",
    )

    with UnitOfWork(engine=test_engine) as uow:
        response = register_user(uow, request)

    assert response.access_token
    assert response.refresh_token
    assert response.token_type == "bearer"

    user = session.exec(select(User).where(User.email == "juan@example.com")).first()
    assert user is not None
    assert verify_password("supersecreto", user.password_hash)
    assert {role.code for role in user.roles} == {"CLIENT"}

    refresh_hash = sha256(response.refresh_token.encode()).hexdigest()
    refresh = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == refresh_hash)
    ).first()
    assert refresh is not None
    assert refresh.revoked_at is None


def test_register_rejects_duplicate_email(client_role, test_engine):
    request = RegisterRequest(
        nombre="Ana",
        apellido="Lopez",
        email="ana@example.com",
        password="supersecreto",
        telefono=None,
    )

    with UnitOfWork(engine=test_engine) as uow:
        register_user(uow, request)

    with UnitOfWork(engine=test_engine) as uow:
        with pytest.raises(HTTPException) as exc:
            register_user(uow, request)

    assert exc.value.status_code == 409
