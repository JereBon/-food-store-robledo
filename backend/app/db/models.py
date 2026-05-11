from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel


class UserRole(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    role_id: int = Field(foreign_key="role.id", primary_key=True)
    assigned_by_id: Optional[int] = Field(default=None, foreign_key="user.id")


class Role(SQLModel, table=True):
    id: int = Field(primary_key=True)
    code: str = Field(index=True, unique=True, max_length=20)
    name: str = Field(max_length=50)

    users: List["User"] = Relationship(
        back_populates="roles",
        link_model=UserRole,
        sa_relationship_kwargs={
            "primaryjoin": "Role.id==UserRole.role_id",
            "secondaryjoin": "User.id==UserRole.user_id",
            "foreign_keys": "[UserRole.role_id, UserRole.user_id]",
        },
    )


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=80)
    apellido: str = Field(max_length=80)
    email: str = Field(index=True, unique=True, max_length=254)
    password_hash: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    telefono: Optional[str] = Field(default=None, max_length=30)
    deleted_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    roles: List[Role] = Relationship(
        back_populates="users",
        link_model=UserRole,
        sa_relationship_kwargs={
            "primaryjoin": "User.id==UserRole.user_id",
            "secondaryjoin": "Role.id==UserRole.role_id",
            "foreign_keys": "[UserRole.user_id, UserRole.role_id]",
        },
    )


class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token_hash: str = Field(unique=True, max_length=64, index=True)
    expires_at: datetime
    revoked_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship()


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
