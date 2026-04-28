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
        cors_origins=_split_csv(os.getenv("CORS_ORIGINS", "http://localhost:5173")),
        seed_admin_email=os.getenv("SEED_ADMIN_EMAIL", "admin@foodstore.local"),
        seed_admin_password=os.getenv("SEED_ADMIN_PASSWORD", "admin123"),
    )


settings = _load_settings()
