from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_token
from app.db.models import User
from app.modules.usuarios.repository import UsersRepository


security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    repo = UsersRepository(session)
    user = repo.get_by_id(int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: Session = Depends(get_session),
) -> User | None:
    """Like get_current_user but returns None instead of raising 401.

    Useful for endpoints that behave differently for authenticated vs anonymous users
    (e.g. public catalog showing only available products).
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        repo = UsersRepository(session)
        user = repo.get_by_id(int(user_id))
        return user
    except HTTPException:
        return None


def require_role(required: list[str]) -> Callable[[User], User]:
    def _dep(user: User = Depends(get_current_user)) -> User:
        user_roles = {r.code for r in (user.roles or [])}
        if not user_roles.intersection(set(required)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return _dep
