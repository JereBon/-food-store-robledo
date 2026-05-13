from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_role
from app.db.models import User
from app.modules.productos.repository import ProductRepository
from app.modules.productos.service import ProductService
from app.modules.productos.schemas import ProductCreate, ProductRead, ProductUpdate
from app.uow import UnitOfWork


router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    """Create a new product (admin or stock manager only)."""
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        service = ProductService(repo)

        try:
            product = service.create(payload)
            uow.session.commit()
            uow.session.refresh(product)
            return product
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[ProductRead])
def list_products(
    category_id: Optional[int] = None,
    include_deleted: bool = False,
    user: User = Depends(get_current_user),
):
    """List all products. Admins see deleted products, others don't. Can filter by category."""
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        include_deleted = include_deleted and any(r.code == "ADMIN" for r in (user.roles or []))
        products = repo.read_all(include_deleted=include_deleted, category_id=category_id)
        return products


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
):
    """Get a single product by ID (public)."""
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id, include_deleted=False)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    """Update a product (admin or stock manager only)."""
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id, include_deleted=False)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        service = ProductService(repo)
        try:
            updated_product = service.update(product, payload)
            uow.session.commit()
            uow.session.refresh(updated_product)
            return updated_product
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    """Delete (soft delete) a product (admin or stock manager only)."""
    with UnitOfWork() as uow:
        repo = ProductRepository(uow.session)
        product = repo.get_by_id(product_id, include_deleted=False)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        repo.delete_soft(product)
        uow.session.commit()
