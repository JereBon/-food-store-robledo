from sqlmodel import Session, select

from app.db.models import User


class UsersRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int) -> User | None:
        return self.session.get(User, id)

    def get_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where(User.email == email)).first()
