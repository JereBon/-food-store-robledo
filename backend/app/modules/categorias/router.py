from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, get_optional_user, require_role
from app.db.models import User
from app.modules.categorias.repository import CategoryRepository
from app.modules.categorias.service import CategoryService
from app.modules.categorias.schemas import CategoryCreate, CategoryListResponse, CategoryRead, CategoryUpdate
from app.uow import UnitOfWork


router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        service = CategoryService(repo)

        try:
            category = service.create(payload)
            uow.session.flush()
            uow.session.refresh(category)
            return category
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=CategoryListResponse)
def list_categories(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    include_deleted: bool = False,
    user: User | None = Depends(get_optional_user),
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        can_see_deleted = user is not None and any(r.code in ("ADMIN", "STOCK") for r in (user.roles or []))
        actual_include = include_deleted and can_see_deleted
        items, total = repo.read_all_paginated(skip=skip, limit=limit, include_deleted=actual_include)
        return CategoryListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(
    category_id: int,
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=False)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return category


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=True)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        service = CategoryService(repo)
        try:
            updated_category = service.update(category, payload)
            uow.session.flush()
            uow.session.refresh(updated_category)
            return updated_category
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=True)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        if category.deleted_at is None:
            repo.delete_soft(category)


@router.patch("/{category_id}/restore", response_model=CategoryRead)
def restore_category(
    category_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=True)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        if category.deleted_at is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category is not deleted")

        repo.restore(category)
        uow.session.flush()
        uow.session.refresh(category)
        return category
