from sqlmodel import Session, select

from app.db.models import Role, User, UserRole
from app.repositories.base import BaseRepository


class UsersRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(session, User)

    def get_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where(User.email == email)).first()

    def get_role_by_code(self, code: str) -> Role | None:
        return self.session.exec(select(Role).where(Role.code == code)).first()

    def assign_role(self, user_id: int, role_id: int, assigned_by_id: int | None = None) -> UserRole:
        user_role = UserRole(user_id=user_id, role_id=role_id, assigned_by_id=assigned_by_id)
        self.session.add(user_role)
        return user_role
