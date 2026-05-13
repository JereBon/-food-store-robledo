from __future__ import annotations

from typing import Any, Generic, TypeVar

from sqlmodel import Session, SQLModel, select, func


T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, id: Any) -> T | None:
        return self.session.get(self.model, id)

    def list_all(self, *, skip: int = 0, limit: int = 100) -> list[T]:
        stmt = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(stmt).all())

    def count(self) -> int:
        return self.session.exec(select(func.count()).select_from(self.model)).one()

    def create(self, obj: T) -> T:
        self.session.add(obj)
        return obj

    def update(self, obj: T, data: dict[str, Any]) -> T:
        for k, v in data.items():
            setattr(obj, k, v)
        self.session.add(obj)
        return obj

    def soft_delete(self, obj: T) -> T:
        # Convention: if model has eliminado_en/deleted_at, set it.
        if hasattr(obj, "eliminado_en"):
            setattr(obj, "eliminado_en", __import__("datetime").datetime.utcnow())
        elif hasattr(obj, "deleted_at"):
            setattr(obj, "deleted_at", __import__("datetime").datetime.utcnow())
        self.session.add(obj)
        return obj

    def hard_delete(self, obj: T) -> None:
        self.session.delete(obj)
