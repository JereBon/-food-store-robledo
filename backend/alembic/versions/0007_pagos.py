"""pagos: forma_pago, pago, forma_pago_id en pedido

Revision ID: 0007_pagos
Revises: 0006_pedidos
Create Date: 2026-05-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0007_pagos"
down_revision = "0006_pedidos"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "formapago",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("nombre", sa.String(length=100), nullable=False),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )

    op.bulk_insert(
        sa.table(
            "formapago",
            sa.column("id", sa.Integer),
            sa.column("nombre", sa.String),
            sa.column("activo", sa.Boolean),
        ),
        [
            {"id": 1, "nombre": "Tarjeta de crédito", "activo": True},
            {"id": 2, "nombre": "Tarjeta de débito", "activo": True},
        ],
    )

    op.create_table(
        "pago",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("pedido_id", sa.Integer(), sa.ForeignKey("pedido.id"), nullable=False),
        sa.Column("monto", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("mp_payment_id", sa.String(length=100), nullable=True),
        sa.Column("mp_status", sa.String(length=50), nullable=False),
        sa.Column("external_reference", sa.String(length=100), nullable=True),
        sa.Column("idempotency_key", sa.String(length=200), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_pago_pedido_id", "pago", ["pedido_id"])

    op.add_column(
        "pedido",
        sa.Column("forma_pago_id", sa.Integer(), sa.ForeignKey("formapago.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("pedido", "forma_pago_id")
    op.drop_table("pago")
    op.drop_table("formapago")
