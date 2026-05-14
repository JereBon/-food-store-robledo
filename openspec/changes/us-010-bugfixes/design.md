## Approach

Correcciones quirúrgicas sin cambios de arquitectura. Cada fix ataca exactamente la causa raíz identificada en la auditoría.

## Backend Tests — Imports Rotos

**Causa raíz:** Los tests de `categorias/` fueron escritos antes de que la arquitectura feature-first migrara `Category` de `app.db.models` a `app.modules.categorias.model`. `app.db.models` solo contiene `User`, `Role`, `UserRole`, `RefreshToken`, `OrderState`, `PaymentMethod`.

**Fix:** Cambiar `from app.db.models import Category` → `from app.modules.categorias.model import Category` en:
- `tests/modules/categorias/test_product_association.py`
- `tests/modules/categorias/test_router.py` (split import)
- `tests/modules/categorias/test_soft_delete.py`

## Backend Tests — Colisión __pycache__

**Causa raíz:** pytest sin `__init__.py` en los directorios usa el nombre de archivo como identificador de módulo. Cuando dos archivos se llaman `test_service.py` (ingredientes y productos), pytest colapsa los módulos en `__pycache__`.

**Fix:** Crear `__init__.py` vacíos en todos los directorios de tests que carecen de él:
- `backend/tests/__init__.py`
- `backend/tests/modules/__init__.py`
- `backend/tests/modules/auth/__init__.py`
- `backend/tests/modules/categorias/__init__.py`
- `backend/tests/modules/ingredientes/__init__.py`
- `backend/tests/modules/productos/__init__.py`

Los directorios `direcciones/`, `pagos/`, `pedidos/` ya tienen `__init__.py`.

## Frontend Tests — Hook Mockeado Incorrectamente

**Causa raíz:** `CategoriesPage` usa `useCategoriesPaginated` (que retorna `{ items, total, skip, limit }`), pero los tests mockeaban `useCategories` (que retorna `ICategory[]` plano). `vi.mock('@/features/categories/api')` auto-mockea todos los exports como `vi.fn()` retornando `undefined`, y al hacer `const { data } = useCategoriesPaginated(...)` se intenta destructurar `undefined`.

**Fix:** En ambos archivos de tests (`CategoriesPage.test.tsx`, `ErrorHandling.test.tsx`), reemplazar el mock de `useCategories` por uno de `useCategoriesPaginated` con formato correcto:
```ts
(api.useCategoriesPaginated as any).mockReturnValue({
  data: { items: mockCategories, total: 2, skip: 0, limit: 10 },
  isLoading: false,
  error: null,
});
```

## Pydantic v2 — class Config Deprecado

**Causa raíz:** Pydantic v2 deprecó `class Config` en favor de `model_config = ConfigDict(...)`. Se eliminará en Pydantic v3.

**Fix:** En `CategoryRead`, `IngredienteRead`, `IngredientReadShort`:
```python
# Antes
class Config:
    from_attributes = True

# Después
from pydantic import ConfigDict
model_config = ConfigDict(from_attributes=True)
```

## Documentación API

**Fix:** Reescribir `docs/API_CATEGORIES.md` en español con:
- Base URL corregida: `/api/v1/categorias`
- Relación corregida: many-to-many via tabla `ProductCategory` (no one-to-many)
- Todo el contenido en español

## .gitignore

**Fix:** Agregar al `.gitignore` raíz:
```
# Logs
*.log
*.err
```
