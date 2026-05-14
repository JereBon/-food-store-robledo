"""pedidos: direccionentrega, pedido, detallepedido, historialestadopedido

Revision ID: 0006_pedidos
Revises: 0005_productos_ingredientes_m2m
Create Date: 2026-05-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0006_pedidos"
down_revision = "0005_productos_ingredientes_m2m"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "direccionentrega",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("calle", sa.String(length=255), nullable=False),
        sa.Column("numero", sa.String(length=20), nullable=True),
        sa.Column("piso", sa.String(length=50), nullable=True),
        sa.Column("ciudad", sa.String(length=100), nullable=False),
        sa.Column("codigo_postal", sa.String(length=20), nullable=True),
        sa.Column("es_predeterminada", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_direccionentrega_usuario_id", "direccionentrega", ["usuario_id"])

    op.create_table(
        "pedido",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("estado_id", sa.Integer(), sa.ForeignKey("orderstate.id"), nullable=False, server_default="1"),
        sa.Column("total", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("costo_envio", sa.DECIMAL(10, 2), nullable=False, server_default="0.00"),
        # Address snapshot fields
        sa.Column("direccion_calle", sa.String(length=255), nullable=False),
        sa.Column("direccion_numero", sa.String(length=20), nullable=True),
        sa.Column("direccion_piso", sa.String(length=50), nullable=True),
        sa.Column("direccion_ciudad", sa.String(length=100), nullable=False),
        sa.Column("direccion_codigo_postal", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_pedido_usuario_id", "pedido", ["usuario_id"])
    op.create_index("ix_pedido_estado_id", "pedido", ["estado_id"])

    op.create_table(
        "detallepedido",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("pedido_id", sa.Integer(), sa.ForeignKey("pedido.id"), nullable=False),
        sa.Column("producto_id", sa.Integer(), sa.ForeignKey("product.id"), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False),
        sa.Column("precio_unitario", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("subtotal", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("exclusiones", sa.JSON(), nullable=False, server_default="[]"),
    )
    op.create_index("ix_detallepedido_pedido_id", "detallepedido", ["pedido_id"])

    op.create_table(
        "historialestadopedido",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("pedido_id", sa.Integer(), sa.ForeignKey("pedido.id"), nullable=False),
        sa.Column("estado_anterior_id", sa.Integer(), sa.ForeignKey("orderstate.id"), nullable=True),
        sa.Column("estado_nuevo_id", sa.Integer(), sa.ForeignKey("orderstate.id"), nullable=False),
        sa.Column("cambiado_por", sa.String(length=100), nullable=False, server_default="SISTEMA"),
        sa.Column("observacion", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_historialestadopedido_pedido_id", "historialestadopedido", ["pedido_id"])


def downgrade() -> None:
    op.drop_index("ix_historialestadopedido_pedido_id", table_name="historialestadopedido")
    op.drop_table("historialestadopedido")
    op.drop_index("ix_detallepedido_pedido_id", table_name="detallepedido")
    op.drop_table("detallepedido")
    op.drop_index("ix_pedido_estado_id", table_name="pedido")
    op.drop_index("ix_pedido_usuario_id", table_name="pedido")
    op.drop_table("pedido")
    op.drop_index("ix_direccionentrega_usuario_id", table_name="direccionentrega")
    op.drop_table("direccionentrega")
