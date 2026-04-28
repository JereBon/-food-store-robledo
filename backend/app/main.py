from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.errors import install_error_handlers
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from app.modules.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(title="Food Store API", version="0.0.0", openapi_url="/openapi.json")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"] ,
        allow_headers=["*"] ,
    )

    # Rate limiting (slowapi)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # Errors (RFC 7807-ish)
    install_error_handlers(app)

    # API router
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
