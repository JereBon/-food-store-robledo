"""add auth user and refresh token fields

Revision ID: 0002_auth_user_refresh
Revises: 0001_seed_tables
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_auth_user_refresh"
down_revision = "0001_seed_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("nombre", sa.String(length=80), nullable=False, server_default=""))
    op.add_column("user", sa.Column("apellido", sa.String(length=80), nullable=False, server_default=""))
    op.add_column("user", sa.Column("telefono", sa.String(length=30), nullable=True))
    op.add_column("user", sa.Column("deleted_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")))

    op.add_column("userrole", sa.Column("assigned_by_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_userrole_assigned_by",
        "userrole",
        "user",
        ["assigned_by_id"],
        ["id"],
    )

    op.create_table(
        "refreshtoken",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_refreshtoken_token_hash", "refreshtoken", ["token_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_refreshtoken_token_hash", table_name="refreshtoken")
    op.drop_table("refreshtoken")
    op.drop_constraint("fk_userrole_assigned_by", "userrole", type_="foreignkey")
    op.drop_column("userrole", "assigned_by_id")
    op.drop_column("user", "updated_at")
    op.drop_column("user", "deleted_at")
    op.drop_column("user", "telefono")
    op.drop_column("user", "apellido")
    op.drop_column("user", "nombre")
