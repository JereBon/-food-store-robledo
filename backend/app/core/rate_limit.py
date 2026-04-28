from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request


limiter = Limiter(key_func=get_remote_address)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    # slowapi default handler shape is ok; keep minimal and compatible
    return request.app.state.limiter._rate_limit_exceeded_handler(request, exc)
