# Tasks — us-010-bugfixes

## Backend: Imports rotos en tests de categorías
- [x] Corregir import en `tests/modules/categorias/test_product_association.py` (reescrito completo para M2M)
- [x] Corregir import en `tests/modules/categorias/test_router.py` (+ encode_token → create_access_token)
- [x] Corregir import en `tests/modules/categorias/test_soft_delete.py`

## Backend: Colisión de módulos __pycache__
- [x] Crear `backend/tests/__init__.py`
- [x] Crear `backend/tests/modules/__init__.py`
- [x] Crear `backend/tests/modules/auth/__init__.py`
- [x] Crear `backend/tests/modules/categorias/__init__.py`
- [x] Crear `backend/tests/modules/ingredientes/__init__.py`
- [x] Crear `backend/tests/modules/productos/__init__.py`

## Backend: Pydantic v2 deprecations
- [x] Migrar `CategoryRead` en `app/modules/categorias/schemas.py`
- [x] Migrar `IngredienteRead` e `IngredientReadShort` en `app/modules/ingredientes/schemas.py`

## Frontend: Hook mock incorrecto
- [x] Actualizar mocks en `__tests__/features/categories/CategoriesPage.test.tsx`
- [x] Actualizar mocks en `__tests__/features/categories/ErrorHandling.test.tsx`

## Documentación y configuración
- [x] Reescribir `docs/API_CATEGORIES.md` en español con URLs correctas
- [x] Agregar `*.log` y `*.err` al `.gitignore` raíz

## Verificación
- [x] Ejecutar `pytest backend/tests/` — 112/112 tests pasan
- [x] Ejecutar `npm test` en frontend — 106/106 tests pasan
