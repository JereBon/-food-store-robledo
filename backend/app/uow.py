from __future__ import annotations

from contextlib import AbstractContextManager

from sqlmodel import Session

from app.core.database import engine


class UnitOfWork(AbstractContextManager):
    def __init__(self):
        self.session: Session | None = None

    def __enter__(self):
        self.session = Session(engine)
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
