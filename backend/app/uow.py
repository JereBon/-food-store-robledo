from __future__ import annotations

from contextlib import AbstractContextManager

from sqlmodel import Session

from app.core.database import engine as default_engine
from app.modules.refreshtokens.repository import RefreshTokensRepository
from app.modules.usuarios.repository import UsersRepository
from app.modules.direcciones.repository import DireccionRepository  # noqa: E402
from app.modules.pedidos.repository import PedidoRepository  # noqa: E402
from app.modules.pagos.repository import FormaPagoRepository, PagoRepository  # noqa: E402


class UnitOfWork(AbstractContextManager):
    def __init__(self, engine=None):
        self._engine = engine or default_engine
        self.session: Session | None = None
        self.users: UsersRepository
        self.refresh_tokens: RefreshTokensRepository
        self.direcciones: DireccionRepository
        self.pedidos: PedidoRepository
        self.pagos: PagoRepository
        self.formas_pago: FormaPagoRepository

    def __enter__(self):
        self.session = Session(self._engine, expire_on_commit=False)
        self.users = UsersRepository(self.session)
        self.refresh_tokens = RefreshTokensRepository(self.session)
        self.direcciones = DireccionRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.pagos = PagoRepository(self.session)
        self.formas_pago = FormaPagoRepository(self.session)
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
