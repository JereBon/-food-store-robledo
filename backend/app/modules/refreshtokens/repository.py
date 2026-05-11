from sqlmodel import Session, select

from app.db.models import RefreshToken
from app.repositories.base import BaseRepository


class RefreshTokensRepository(BaseRepository[RefreshToken]):
    def __init__(self, session: Session):
        super().__init__(session, RefreshToken)

    def get_by_token_hash(self, token_hash: str) -> RefreshToken | None:
        return self.session.exec(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        ).first()
