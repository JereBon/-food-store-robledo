import os
from dataclasses import dataclass


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    env: str
    database_url: str
    secret_key: str
    jwt_algorithm: str
    jwt_access_token_expire_minutes: int
    jwt_refresh_token_expire_days: int
    cors_origins: list[str]
    seed_admin_email: str
    seed_admin_password: str
    mercadopago_access_token: str
    mercadopago_public_key: str
    frontend_url: str
    backend_url: str


def _load_settings() -> Settings:
    return Settings(
        env=os.getenv("ENV", "dev"),
        database_url=os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/food_store",
        ),
        secret_key=os.getenv("SECRET_KEY", "change-me"),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        jwt_access_token_expire_minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
        jwt_refresh_token_expire_days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7")),
        cors_origins=_split_csv(os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176")),
        seed_admin_email=os.getenv("SEED_ADMIN_EMAIL", "admin@foodstore.local"),
        seed_admin_password=os.getenv("SEED_ADMIN_PASSWORD", "admin123"),
        mercadopago_access_token=os.getenv("MERCADOPAGO_ACCESS_TOKEN", "TEST-change-me"),
        mercadopago_public_key=os.getenv("MERCADOPAGO_PUBLIC_KEY", "TEST-change-me"),
        frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
        backend_url=os.getenv("BACKEND_URL", "http://localhost:8000"),
    )


settings = _load_settings()
