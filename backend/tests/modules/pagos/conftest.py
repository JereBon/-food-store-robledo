"""Patch the UoW default_engine to use SQLite for tests."""
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

import app.uow as uow_module


@pytest.fixture(autouse=True)
def sqlite_engine(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    monkeypatch.setattr(uow_module, "default_engine", engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def session(sqlite_engine):
    with Session(sqlite_engine) as s:
        yield s
