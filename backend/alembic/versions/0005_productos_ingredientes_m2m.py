"""productos: add disponible, imagen_url, categoria M2M, ingredientes

Revision ID: 0005_productos_ingredientes_m2m
Revises: 0004_create_products
Create Date: 2026-05-13
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_productos_ingredientes_m2m"
down_revision = "0004_create_products"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ingredient table
    op.create_table(
        "ingrediente",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("nombre", sa.String(length=100), nullable=False, unique=True),
        sa.Column("es_alergeno", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_ingrediente_nombre", "ingrediente", ["nombre"], unique=True)

    # Create product-category pivot table
    op.create_table(
        "productocategoria",
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id"), primary_key=True, nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), primary_key=True, nullable=False),
    )

    # Create product-ingredient pivot table
    op.create_table(
        "productoingrediente",
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id"), primary_key=True, nullable=False),
        sa.Column("ingrediente_id", sa.Integer(), sa.ForeignKey("ingrediente.id"), primary_key=True, nullable=False),
        sa.Column("es_removible", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )

    # Add new columns to product
    op.add_column("product", sa.Column("disponible", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("product", sa.Column("imagen_url", sa.String(length=500), nullable=True))

    # Migrate existing category_id data to productocategoria pivot
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "INSERT INTO productocategoria (product_id, category_id) "
            "SELECT id, category_id FROM product WHERE category_id IS NOT NULL"
        )
    )

    # Drop old category_id column and index
    op.drop_index("ix_product_category_id", table_name="product")
    op.drop_column("product", "category_id")


def downgrade() -> None:
    # Restore category_id column
    op.add_column("product", sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), nullable=True))
    op.create_index("ix_product_category_id", "product", ["category_id"])

    # Migrate data back (take first category if multiple)
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "UPDATE product SET category_id = pc.category_id "
            "FROM (SELECT DISTINCT ON (product_id) product_id, category_id FROM productocategoria) pc "
            "WHERE product.id = pc.product_id"
        )
    )

    # Drop new tables and columns
    op.drop_table("productoingrediente")
    op.drop_table("productocategoria")
    op.drop_index("ix_ingrediente_nombre", table_name="ingrediente")
    op.drop_table("ingrediente")
    op.drop_column("product", "imagen_url")
    op.drop_column("product", "disponible")
