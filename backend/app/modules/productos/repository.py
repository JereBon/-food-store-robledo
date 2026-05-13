from typing import Optional, List

from sqlmodel import Session, select, func

from app.repositories.base import BaseRepository
from app.modules.productos.model import Product, ProductCategory, ProductIngredient
from app.modules.categorias.model import Category
from app.modules.ingredientes.model import Ingrediente


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session: Session):
        super().__init__(session, Product)

    def get_by_id(self, product_id: int) -> Optional[Product]:
        return self.session.get(Product, product_id)

    def list_filtered(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        include_deleted: bool = False,
        only_available: bool = False,
    ) -> tuple[List[Product], int]:
        stmt = select(Product).offset(skip).limit(limit)
        count_stmt = select(func.count(Product.id))

        if not include_deleted:
            stmt = stmt.where(Product.deleted_at.is_(None))
            count_stmt = count_stmt.where(Product.deleted_at.is_(None))
        if only_available:
            stmt = stmt.where(Product.disponible == True)
            count_stmt = count_stmt.where(Product.disponible == True)
        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search}%"))
            count_stmt = count_stmt.where(Product.name.ilike(f"%{search}%"))
        if category_id is not None:
            subq = select(ProductCategory.product_id).where(
                ProductCategory.category_id == category_id
            )
            stmt = stmt.where(Product.id.in_(subq))
            count_stmt = count_stmt.where(Product.id.in_(subq))

        total = self.session.exec(count_stmt).one()
        products = list(self.session.exec(stmt).all())
        return products, total

    def set_categories(self, product_id: int, category_ids: list[int]) -> None:
        old = self.session.exec(
            select(ProductCategory).where(ProductCategory.product_id == product_id)
        ).all()
        for row in old:
            self.session.delete(row)
        for cat_id in category_ids:
            self.session.add(ProductCategory(product_id=product_id, category_id=cat_id))

    def set_ingredients(
        self, product_id: int, ingredient_data: list[dict]
    ) -> None:
        old = self.session.exec(
            select(ProductIngredient).where(
                ProductIngredient.product_id == product_id
            )
        ).all()
        for row in old:
            self.session.delete(row)
        for data in ingredient_data:
            self.session.add(
                ProductIngredient(
                    product_id=product_id,
                    ingrediente_id=data["ingrediente_id"],
                    es_removible=data.get("es_removible", False),
                )
            )

    def validate_categories_exist(self, category_ids: list[int]) -> bool:
        for cat_id in category_ids:
            stmt = select(Category).where(
                Category.id == cat_id, Category.deleted_at.is_(None)
            )
            if not self.session.exec(stmt).first():
                return False
        return True

    def validate_ingredients_exist(self, ingredient_ids: list[int]) -> bool:
        for ing_id in ingredient_ids:
            stmt = select(Ingrediente).where(
                Ingrediente.id == ing_id, Ingrediente.deleted_at.is_(None)
            )
            if not self.session.exec(stmt).first():
                return False
        return True
