from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class UserRole(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    role_id: int = Field(foreign_key="role.id", primary_key=True)


class Role(SQLModel, table=True):
    id: int = Field(primary_key=True)
    code: str = Field(index=True, unique=True, max_length=20)
    name: str = Field(max_length=50)

    users: list[User] = Relationship(back_populates="roles", link_model=UserRole)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=254)
    password_hash: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    roles: list[Role] = Relationship(back_populates="users", link_model=UserRole)


class OrderState(SQLModel, table=True):
    id: int = Field(primary_key=True)
    code: str = Field(unique=True, max_length=30)
    name: str = Field(max_length=50)
    is_terminal: bool = Field(default=False)


class PaymentMethod(SQLModel, table=True):
    id: int = Field(primary_key=True)
    code: str = Field(unique=True, max_length=30)
    name: str = Field(max_length=50)
    enabled: bool = Field(default=True)
