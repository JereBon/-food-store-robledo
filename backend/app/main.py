import re

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.errors import install_error_handlers
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from app.modules.router import api_router


# Monkey-patch email_validator to accept .local domains in dev
try:
    import email_validator
    original_validate = email_validator.validate_email

    def _lax_validate(email, **kwargs):
        kwargs.setdefault("test_environment", True)
        try:
            return original_validate(email, **kwargs)
        except email_validator.EmailSyntaxError:
            # Accept any reasonable-looking email (for dev)
            if re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
                from email_validator.types import ValidatedEmail
                local, domain = email.split("@", 1)
                info = ValidatedEmail()
                info.original = email
                info.normalized = email
                info.local_part = local
                info.domain = domain
                info.ascii_email = email
                info.ascii_local_part = local
                info.ascii_domain = domain
                info.smtputf8 = True
                info.mx = ()
                info.mx_fallback_type = None
                info.display_name = ""
                return info
            raise

    email_validator.validate_email = _lax_validate
except ImportError:
    pass


def create_app() -> FastAPI:
    app = FastAPI(title="Food Store API", version="0.0.0", openapi_url="/openapi.json")

    # CORS — outermost middleware (added last = runs first on request)
    cors_origins = ["*"] if settings.env == "dev" else settings.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
