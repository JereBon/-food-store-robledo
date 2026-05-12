from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.deps import get_current_user, require_role
from app.core.database import get_session
from app.db.models import User
from app.modules.categorias.model import Category
from app.modules.categorias.repository import CategoryRepository
from app.modules.categorias.service import CategoryService
from app.modules.categorias.schemas import CategoryCreate, CategoryRead, CategoryUpdate
from app.uow import UnitOfWork


router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    user: User = Depends(require_role(["ADMIN"])),
    session: Session = Depends(get_session),
):
    """
    Create a new category.
    
    **Requires:** ADMIN role
    
    **Parameters:**
    - `name`: Category name (unique, max 100 chars)
    - `description`: Optional category description (max 500 chars)
    
    **Returns:** Created category object with id, slug, and timestamps
    
    **Errors:**
    - `400`: Duplicate category name or invalid data
    - `403`: User is not an admin
    """
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        service = CategoryService(repo)

        try:
            category = service.create(payload)
            uow.session.commit()
            uow.session.refresh(category)
            return category
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[CategoryRead])
def list_categories(
    include_deleted: bool = False,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """
    List all categories.
    
    **Public endpoint** - All authenticated users can access
    
    **Query Parameters:**
    - `include_deleted`: If true and user is admin, includes soft-deleted categories (default: false)
    
    **Returns:** List of category objects
    
    **Note:** Non-admin users only see non-deleted categories regardless of `include_deleted` parameter
    """
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        # Only admins see deleted categories
        include_deleted = include_deleted and any(r.code == "ADMIN" for r in (user.roles or []))
        categories = repo.read_all(include_deleted=include_deleted)
        return categories


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(
    category_id: int,
    session: Session = Depends(get_session),
):
    """
    Get a single category by ID.
    
    **Public endpoint** - Returns non-deleted categories only
    
    **Path Parameters:**
    - `category_id`: The category ID to retrieve
    
    **Returns:** Category object with full details
    
    **Errors:**
    - `404`: Category not found or has been deleted
    """
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
    user: User = Depends(require_role(["ADMIN"])),
    session: Session = Depends(get_session),
):
    """
    Update a category.
    
    **Requires:** ADMIN role
    
    **Path Parameters:**
    - `category_id`: The category ID to update
    
    **Request Body:**
    - `name`: New category name (optional, if provided must be unique)
    - `description`: New category description (optional)
    
    **Returns:** Updated category object
    
    **Errors:**
    - `400`: Invalid data or duplicate category name
    - `403`: User is not an admin
    - `404`: Category not found or has been deleted
    """
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=False)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        service = CategoryService(repo)
        try:
            updated_category = service.update(category, payload)
            uow.session.commit()
            uow.session.refresh(updated_category)
            return updated_category
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    user: User = Depends(require_role(["ADMIN"])),
    session: Session = Depends(get_session),
):
    """
    Delete (soft delete) a category.
    
    **Requires:** ADMIN role
    
    **Path Parameters:**
    - `category_id`: The category ID to delete
    
    **Implementation:** Uses soft delete (sets deleted_at timestamp)
    
    **Returns:** 204 No Content on success
    
    **Errors:**
    - `400`: Cannot delete category with associated products
    - `403`: User is not an admin
    - `404`: Category not found or already deleted
    """
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        category = repo.get_by_id(category_id, include_deleted=False)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        service = CategoryService(repo)
        try:
            service.delete_with_validation(category)
            uow.session.commit()
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
