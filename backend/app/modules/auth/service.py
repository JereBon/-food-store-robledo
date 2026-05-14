from __future__ import annotations

from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import RefreshToken, User
from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, RoleResponse
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
        user=UserResponse(
            id=user.id,
            email=user.email,
            nombre=user.nombre,
            apellido=user.apellido,
            roles=[RoleResponse(id=role_id, code="CLIENT")]
        )
    )


def authenticate_user(uow: UnitOfWork, request: LoginRequest) -> TokenResponse:
    user = uow.users.get_by_email(request.email)
    
    # RN-AU08: No diferenciar email de password en el error
    error_msg = "Email o contraseña incorrectos"
    
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada")

    roles = [r.code for r in user.roles]
    access_token = create_access_token(subject=str(user.id), roles=roles)
    refresh_token = _create_refresh_token(uow, user_id=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            nombre=user.nombre,
            apellido=user.apellido,
            roles=[RoleResponse(id=r.id, code=r.code) for r in user.roles]
        )
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
