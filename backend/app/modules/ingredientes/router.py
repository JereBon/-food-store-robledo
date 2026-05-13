from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_role
from app.db.models import User
from app.modules.ingredientes.repository import IngredienteRepository
from app.modules.ingredientes.service import IngredienteService
from app.modules.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
)
from app.uow import UnitOfWork


router = APIRouter(prefix="/ingredientes", tags=["ingredients"])


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create_ingredient(
    payload: IngredienteCreate,
    user: User = Depends(require_role(["ADMIN"])),
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


@router.get("", response_model=list[IngredienteRead])
def list_ingredients(
    es_alergeno: bool | None = None,
    include_deleted: bool = False,
    user: User = Depends(get_current_user),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        return repo.list_filtered(include_deleted=include_deleted, es_alergeno=es_alergeno)


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
    user: User = Depends(require_role(["ADMIN"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient or ingredient.deleted_at is not None:
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
    user: User = Depends(require_role(["ADMIN"])),
):
    with UnitOfWork() as uow:
        repo = IngredienteRepository(uow.session)
        ingredient = repo.get_by_id(ingredient_id)
        if not ingredient or ingredient.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
            )
        repo.soft_delete(ingredient)
