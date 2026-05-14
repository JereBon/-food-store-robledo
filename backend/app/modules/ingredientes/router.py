from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, get_optional_user, require_role
from app.db.models import User
from app.modules.ingredientes.repository import IngredienteRepository
from app.modules.ingredientes.service import IngredienteService
from app.modules.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
    IngredientListResponse,
)
from app.uow import UnitOfWork


router = APIRouter(prefix="/ingredientes", tags=["ingredients"])


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create_ingredient(
    payload: IngredienteCreate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        service = IngredienteService(repo)
        try:
            ingredient = service.create(payload)
            uow.session.flush()
            uow.session.refresh(ingredient)
            return ingredient
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=IngredientListResponse)
def list_ingredients(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    es_alergeno: bool | None = None,
    include_deleted: bool = False,
    user: User | None = Depends(get_optional_user),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        can_see_deleted = user is not None and any(r.code in ("ADMIN", "STOCK") for r in (user.roles or []))
        actual_include = include_deleted and can_see_deleted
        items, total = repo.list_paginated(skip=skip, limit=limit, include_deleted=actual_include, es_alergeno=es_alergeno)
        return IngredientListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{ingredient_id}", response_model=IngredienteRead)
def get_ingredient(ingredient_id: int):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient or ingredient.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )
        return ingredient


@router.put("/{ingredient_id}", response_model=IngredienteRead)
def update_ingredient(
    ingredient_id: int,
    payload: IngredienteUpdate,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )
        service = IngredienteService(repo)
        try:
            updated = service.update(ingredient, payload)
            uow.session.flush()
            uow.session.refresh(updated)
            return updated
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(
    ingredient_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )

        if ingredient.deleted_at is None:
            repo.soft_delete(ingredient)


@router.patch("/{ingredient_id}/restore", response_model=IngredienteRead)
def restore_ingredient(
    ingredient_id: int,
    user: User = Depends(require_role(["ADMIN", "STOCK"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )
        if ingredient.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Ingredient is not deleted"
            )

        repo.restore(ingredient)
        uow.session.flush()
        uow.session.refresh(ingredient)
        return ingredient
