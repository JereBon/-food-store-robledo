"""create categories table

Revision ID: 0003_create_categories
Revises: 0002_auth_user_refresh
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_create_categories"
down_revision = "0002_auth_user_refresh"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "category",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_category_slug", "category", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_category_slug", table_name="category")
    op.drop_table("category")
