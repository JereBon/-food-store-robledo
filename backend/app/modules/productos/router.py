from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select

from app.core.deps import get_current_user, get_optional_user, require_role
from app.db.models import User
from app.modules.productos.pivot import ProductIngredient
from app.modules.productos.repository import ProductRepository
from app.modules.productos.service import ProductService
from app.modules.productos.schemas import (
    ProductCreate,
    ProductRead,
    ProductUpdate,
    ProductListResponse,
)
from app.uow import UnitOfWork


router = APIRouter(prefix="/products", tags=["products"])


def _load(product, session):
    """Force-load lazy relationships and attach pivot data while session is open."""
    _ = product.categories
    _ = product.ingredients
    pivots = session.exec(
        select(ProductIngredient).where(ProductIngredient.product_id == product.id)
    ).all()
    pivot_map = {p.ingrediente_id: p.es_removible for p in pivots}
    for ing in product.ingredients:
        object.__setattr__(ing, "es_removible", pivot_map.get(ing.id, False))
    return product


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        service = ProductService(repo)
        try:
            product = service.create(payload)
            uow.session.flush()
            uow.session.refresh(product)
            return _load(product, uow.session)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=ProductListResponse)
def list_products(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    include_deleted: bool = False,
    user: Optional[User] = Depends(get_optional_user),
):
    is_admin = user is not None and any(r.code == "ADMIN" for r in (user.roles or []))
    include_deleted = include_deleted and is_admin
    only_available = user is None

    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        products, total = repo.list_filtered(
            skip=skip,
            limit=limit,
            search=search,
            category_id=category_id,
            include_deleted=include_deleted,
            only_available=only_available,
        )
        [_load(p, uow.session) for p in products]
        return ProductListResponse(
            items=products, total=total, skip=skip, limit=limit
        )


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return _load(product, uow.session)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        service = ProductService(repo)
        try:
            updated_product = service.update(product, payload)
            uow.session.flush()
            uow.session.refresh(updated_product)
            return _load(updated_product, uow.session)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{product_id}/stock", response_model=ProductRead)
def update_product_stock(
    product_id: int,
    cantidad: int = Query(..., ge=0),
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        service = ProductService(repo)
        try:
            updated = service.update_stock(product, cantidad)
            uow.session.flush()
            uow.session.refresh(updated)
            return _load(updated, uow.session)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{product_id}/ingredients", response_model=ProductRead)
def set_product_ingredients(
    product_id: int,
    ingredient_data: list[dict],
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        ingredient_ids = [d["ingrediente_id"] for d in ingredient_data]
        if not repo.validate_ingredients_exist(ingredient_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more ingredients not found or deleted",
            )

        repo.set_ingredients(product_id, ingredient_data)
        uow.session.flush()
        uow.session.refresh(product)
        return _load(product, uow.session)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if product.deleted_at is None:
            repo.soft_delete(product)


@router.patch("/{product_id}/restore", response_model=ProductRead)
def restore_product(
    product_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        if product.deleted_at is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product is not deleted")

        repo.restore(product)
        uow.session.flush()
        uow.session.refresh(product)
        return _load(product, uow.session)
