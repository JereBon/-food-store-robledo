from fastapi import APIRouter, status

from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.modules.auth.service import register_user, authenticate_user
from app.uow import UnitOfWork


router = APIRouter(prefix="/auth")


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    with UnitOfWork() as uow:
        return register_user(uow, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    with UnitOfWork() as uow:
        return authenticate_user(uow, payload)
