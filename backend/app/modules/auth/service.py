from __future__ import annotations

from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.models import RefreshToken, User
from app.modules.auth.schemas import RegisterRequest, TokenResponse
from app.uow import UnitOfWork


def _ensure_client_role(uow: UnitOfWork) -> int:
    role = uow.users.get_role_by_code("CLIENT")
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Role CLIENT missing",
        )
    return role.id


def register_user(uow: UnitOfWork, request: RegisterRequest) -> TokenResponse:
    if uow.users.get_by_email(request.email):
        raise HTTPException(status_code=409, detail="El email ya esta registrado")

    password_hash = hash_password(request.password)
    user = User(
        nombre=request.nombre,
        apellido=request.apellido,
        email=request.email,
        password_hash=password_hash,
        telefono=request.telefono,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    uow.users.create(user)
    uow.session.flush()

    role_id = _ensure_client_role(uow)
    uow.users.assign_role(user_id=user.id, role_id=role_id)

    access_token = create_access_token(subject=str(user.id), roles=["CLIENT"])
    refresh_token = _create_refresh_token(uow, user_id=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


def _create_refresh_token(uow: UnitOfWork, user_id: int) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )

    refresh = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        revoked_at=None,
        created_at=datetime.now(timezone.utc),
    )
    uow.refresh_tokens.create(refresh)

    return raw_token
