from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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

    # MP back_url redirects → forward browser to local frontend
    @app.get("/pago/exito", include_in_schema=False)
    async def mp_exito(request: Request) -> RedirectResponse:
        qs = request.url.query
        dest = "http://localhost:5173/pago/exito"
        return RedirectResponse(url=f"{dest}?{qs}" if qs else dest)

    @app.get("/pago/pendiente", include_in_schema=False)
    async def mp_pendiente(request: Request) -> RedirectResponse:
        qs = request.url.query
        dest = "http://localhost:5173/pago/pendiente"
        return RedirectResponse(url=f"{dest}?{qs}" if qs else dest)

    @app.get("/pago/fallo", include_in_schema=False)
    async def mp_fallo(request: Request) -> RedirectResponse:
        qs = request.url.query
        dest = "http://localhost:5173/pago/fallo"
        return RedirectResponse(url=f"{dest}?{qs}" if qs else dest)

    return app


app = create_app()
