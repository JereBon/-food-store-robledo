from __future__ import annotations

from contextlib import AbstractContextManager

from sqlmodel import Session

from app.core.database import engine as default_engine
from app.modules.refreshtokens.repository import RefreshTokensRepository
from app.modules.usuarios.repository import UsersRepository


class UnitOfWork(AbstractContextManager):
    def __init__(self, engine=None):
        self._engine = engine or default_engine
        self.session: Session | None = None
        self.users: UsersRepository
        self.refresh_tokens: RefreshTokensRepository

    def __enter__(self):
        self.session = Session(self._engine)
        self.users = UsersRepository(self.session)
        self.refresh_tokens = RefreshTokensRepository(self.session)
        return self

    def __exit__(self, exc_type, exc, tb):
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
