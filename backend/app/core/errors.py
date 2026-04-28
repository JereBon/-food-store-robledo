from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def _problem(status: int, title: str, detail: str | None = None):
    body = {
        "type": "about:blank",
        "title": title,
        "status": status,
    }
    if detail:
        body["detail"] = detail
    return body


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=_problem(exc.status_code, "HTTP Error", str(exc.detail)),
            media_type="application/problem+json",
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content=_problem(422, "Validation Error", str(exc)),
            media_type="application/problem+json",
        )
