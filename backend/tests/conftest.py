import os
import sys
from collections.abc import Generator
from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


@pytest.fixture(scope="session")
def test_engine() -> Generator:
    db_url = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/foodstore_test",
    )
    engine = create_engine(db_url, pool_pre_ping=True)
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def session(test_engine):
    with Session(test_engine) as session:
        yield session
