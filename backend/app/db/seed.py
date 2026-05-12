from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import engine
from app.core.security import hash_password
from app.db.models import OrderState, PaymentMethod, Role, User, UserRole


def _upsert_role(session: Session, *, id: int, code: str, name: str) -> None:
    existing = session.exec(select(Role).where(Role.id == id)).first()
    if existing:
        existing.code = code
        existing.name = name
        session.add(existing)
        return
    session.add(Role(id=id, code=code, name=name))


def _upsert_state(session: Session, *, id: int, code: str, name: str, is_terminal: bool) -> None:
    existing = session.exec(select(OrderState).where(OrderState.id == id)).first()
    if existing:
        existing.code = code
        existing.name = name
        existing.is_terminal = is_terminal
        session.add(existing)
        return
    session.add(OrderState(id=id, code=code, name=name, is_terminal=is_terminal))


def _upsert_payment_method(session: Session, *, id: int, code: str, name: str, enabled: bool = True) -> None:
    existing = session.exec(select(PaymentMethod).where(PaymentMethod.id == id)).first()
    if existing:
        existing.code = code
        existing.name = name
        existing.enabled = enabled
        session.add(existing)
        return
    session.add(PaymentMethod(id=id, code=code, name=name, enabled=enabled))


def _ensure_admin(session: Session) -> None:
    admin = session.exec(select(User).where(User.email == settings.seed_admin_email)).first()
    if not admin:
        admin = User(
            email=settings.seed_admin_email,
            password_hash=hash_password(settings.seed_admin_password),
            nombre="Admin",
            apellido="System"
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)

    # Ensure role ADMIN (id=1)
    link = session.exec(
        select(UserRole).where(UserRole.user_id == admin.id).where(UserRole.role_id == 1)
    ).first()
    if not link:
        session.add(UserRole(user_id=admin.id, role_id=1))


def run_seed() -> None:
    with Session(engine) as session:
        # Roles with stable IDs
        _upsert_role(session, id=1, code="ADMIN", name="Administrador")
        _upsert_role(session, id=2, code="STOCK", name="Gestor de Stock")
        _upsert_role(session, id=3, code="PEDIDOS", name="Gestor de Pedidos")
        _upsert_role(session, id=4, code="CLIENT", name="Cliente")

        # Order states with stable IDs
        _upsert_state(session, id=1, code="PENDIENTE", name="Pendiente", is_terminal=False)
        _upsert_state(session, id=2, code="CONFIRMADO", name="Confirmado", is_terminal=False)
        _upsert_state(session, id=3, code="EN_PREPARACION", name="En preparación", is_terminal=False)
        _upsert_state(session, id=4, code="EN_CAMINO", name="En camino", is_terminal=False)
        _upsert_state(session, id=5, code="ENTREGADO", name="Entregado", is_terminal=True)
        _upsert_state(session, id=6, code="CANCELADO", name="Cancelado", is_terminal=True)

        # Payment methods
        _upsert_payment_method(session, id=1, code="TARJETA_CREDITO", name="Tarjeta de crédito")
        _upsert_payment_method(session, id=2, code="TARJETA_DEBITO", name="Tarjeta de débito")

        session.commit()

        _ensure_admin(session)
        session.commit()


if __name__ == "__main__":
    run_seed()
