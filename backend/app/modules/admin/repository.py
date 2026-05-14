from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlmodel import Session, select, func

from app.db.models import RefreshToken, Role, User, UserRole


class AdminRepository:
    def __init__(self, session: Session):
        self.session = session

    # ── User management ──────────────────────────────────────────────

    def list_users(
        self,
        q: str | None = None,
        rol: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[User], int]:
        """Return (users, total_count) with optional search and role filter."""
        base_query = select(User).where(User.deleted_at.is_(None))

        if q:
            like = f"%{q}%"
            filter_clause = (
                User.nombre.ilike(like)
                | User.apellido.ilike(like)
                | User.email.ilike(like)
            )
            base_query = base_query.where(filter_clause)

        if rol:
            base_query = (
                base_query.join(UserRole, UserRole.user_id == User.id)
                .join(Role, Role.id == UserRole.role_id)
                .where(Role.code == rol.upper())
            )

        # Count with subquery to avoid join ambiguity issues
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = self.session.exec(count_stmt).one()

        offset = (page - 1) * page_size
        query = (
            base_query.offset(offset)
            .limit(page_size)
            .order_by(User.created_at.desc())
        )

        users = list(self.session.exec(query).unique().all())
        # Eager-load roles for each user
        for u in users:
            _ = u.roles

        return users, total

    def get_user_by_id(self, user_id: int) -> User | None:
        user = self.session.get(User, user_id)
        if user and user.deleted_at is not None:
            return None
        if user:
            _ = user.roles
        return user

    def update_user(self, user_id: int, data: dict[str, Any]) -> User | None:
        user = self.get_user_by_id(user_id)
        if user is None:
            return None

        updatable = {"nombre", "apellido", "telefono", "is_active"}
        for key, value in data.items():
            if key in updatable:
                setattr(user, key, value)

        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        self.session.flush()
        _ = user.roles
        return user

    def count_admins(self) -> int:
        """Count active users with ADMIN role."""
        stmt = (
            select(func.count(User.id))
            .join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .where(Role.code == "ADMIN")
            .where(User.deleted_at.is_(None))
            .where(User.is_active.is_(True))
        )
        return self.session.exec(stmt).one()

    def set_user_roles(self, user_id: int, role_codes: list[str]) -> list[Role]:
        """Replace all roles of a user with the given codes."""
        roles = (
            self.session.exec(select(Role).where(Role.code.in_(role_codes)))
            .unique()
            .all()
        )
        if len(roles) != len(role_codes):
            existing = {r.code for r in roles}
            missing = set(role_codes) - existing
            raise ValueError(f"Roles not found: {missing}")

        # Remove existing roles
        existing_links = self.session.exec(
            select(UserRole).where(UserRole.user_id == user_id)
        ).all()
        for link in existing_links:
            self.session.delete(link)

        # Assign new roles
        for role in roles:
            self.session.add(UserRole(user_id=user_id, role_id=role.id))

        self.session.flush()
        return roles

    def revoke_all_refresh_tokens(self, user_id: int) -> None:
        """Revoke all active refresh tokens for a user."""
        now = datetime.now(timezone.utc)
        stmt = (
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.revoked_at.is_(None))
        )
        tokens = self.session.exec(stmt).all()
        for token in tokens:
            token.revoked_at = now
            self.session.add(token)
        self.session.flush()

    # ── Metrics ──────────────────────────────────────────────────────

    def get_resumen(
        self, desde: datetime | None = None, hasta: datetime | None = None
    ) -> dict[str, Any]:
        """Return aggregated metrics summary for the given period."""
        from app.modules.pedidos.model import Pedido

        filters = ""
        params: dict[str, Any] = {}
        if desde:
            filters += " AND p.created_at >= :desde"
            params["desde"] = desde
        if hasta:
            filters += " AND p.created_at <= :hasta"
            params["hasta"] = hasta

        # Total ventas (sum of total from confirmed/delivered orders)
        ventas_sql = text(
            f"SELECT COALESCE(SUM(p.total), 0) FROM pedido p "
            f"JOIN orderstate os ON p.estado_id = os.id "
            f"WHERE os.code IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'){filters}"
        )
        total_ventas = self.session.execute(ventas_sql, params).scalar() or Decimal("0.00")

        # Pedidos por estado
        pedidos_sql = text(
            f"SELECT os.code, os.name, COUNT(*) as cnt "
            f"FROM pedido p "
            f"JOIN orderstate os ON p.estado_id = os.id "
            f"WHERE 1=1{filters} "
            f"GROUP BY os.id, os.code, os.name "
            f"ORDER BY os.id"
        )
        rows = self.session.execute(pedidos_sql, params).all()
        pedidos_por_estado = [
            {"code": r[0], "name": r[1], "cantidad": r[2]} for r in rows
        ]

        # Usuarios registrados
        usuarios_filters = ""
        usuarios_params: dict[str, Any] = {}
        if desde:
            usuarios_filters += " AND u.created_at >= :desde"
            usuarios_params["desde"] = desde
        if hasta:
            usuarios_filters += " AND u.created_at <= :hasta"
            usuarios_params["hasta"] = hasta
        usuarios_sql = text(
            f"SELECT COUNT(*) FROM \"user\" u WHERE u.deleted_at IS NULL{usuarios_filters}"
        )
        total_usuarios = self.session.execute(usuarios_sql, usuarios_params).scalar() or 0

        return {
            "total_ventas": float(total_ventas),
            "total_pedidos": sum(r[2] for r in rows),
            "pedidos_por_estado": pedidos_por_estado,
            "total_usuarios": total_usuarios,
        }

    def get_ventas_series(
        self,
        desde: datetime | None = None,
        hasta: datetime | None = None,
        granularidad: str = "dia",
    ) -> list[dict[str, Any]]:
        """Return time series of sales grouped by granularity."""
        from app.modules.pedidos.model import Pedido

        trunc_map = {"dia": "day", "semana": "week", "mes": "month"}
        trunc = trunc_map.get(granularidad, "day")

        filters = " AND os.code IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO')"
        params: dict[str, Any] = {}
        if desde:
            filters += " AND p.created_at >= :desde"
            params["desde"] = desde
        if hasta:
            filters += " AND p.created_at <= :hasta"
            params["hasta"] = hasta

        sql = text(
            f"SELECT DATE_TRUNC('{trunc}', p.created_at) AS periodo, "
            f"COALESCE(SUM(p.total), 0) AS monto, "
            f"COUNT(*) AS cantidad "
            f"FROM pedido p "
            f"JOIN orderstate os ON p.estado_id = os.id "
            f"WHERE 1=1{filters} "
            f"GROUP BY periodo "
            f"ORDER BY periodo ASC"
        )
        rows = self.session.execute(sql, params).all()
        return [
            {
                "periodo": r[0].isoformat() if hasattr(r[0], "isoformat") else str(r[0]),
                "monto": float(r[1]),
                "cantidad": r[2],
            }
            for r in rows
        ]

    def get_top_productos(
        self,
        desde: datetime | None = None,
        hasta: datetime | None = None,
        limite: int = 10,
    ) -> list[dict[str, Any]]:
        """Return top N most-sold products by units (delivered orders only)."""
        from app.modules.pedidos.model import DetallePedido, Pedido

        filters = " AND os.code IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO')"
        params: dict[str, Any] = {"limite": limite}
        if desde:
            filters += " AND p.created_at >= :desde"
            params["desde"] = desde
        if hasta:
            filters += " AND p.created_at <= :hasta"
            params["hasta"] = hasta

        sql = text(
            f"SELECT dp.producto_id, pr.name, SUM(dp.cantidad) AS total_unidades "
            f"FROM detallepedido dp "
            f"JOIN pedido p ON dp.pedido_id = p.id "
            f"JOIN orderstate os ON p.estado_id = os.id "
            f"JOIN product pr ON dp.producto_id = pr.id "
            f"WHERE 1=1{filters} "
            f"GROUP BY dp.producto_id, pr.name "
            f"ORDER BY total_unidades DESC "
            f"LIMIT :limite"
        )
        rows = self.session.execute(sql, params).all()
        return [
            {
                "producto_id": r[0],
                "nombre": r[1],
                "total_unidades": r[2],
            }
            for r in rows
        ]
