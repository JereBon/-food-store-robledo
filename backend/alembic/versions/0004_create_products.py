"""create products table with category_id

Revision ID: 0004_create_products
Revises: 0003_create_categories
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_create_products"
down_revision = "0003_create_categories"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_product_name", "product", ["name"])
    op.create_index("ix_product_category_id", "product", ["category_id"])


def downgrade() -> None:
    op.drop_index("ix_product_category_id", table_name="product")
    op.drop_index("ix_product_name", table_name="product")
    op.drop_table("product")
