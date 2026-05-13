## 1. Modelos y Migración

- [x] 1.1 Agregar campos `disponible` (bool, default true) e `imagen_url` (Optional[str]) al modelo Product
- [x] 1.2 Cambiar `price` de `float` a `Decimal(10,2)` en modelo Product y schemas Pydantic
- [x] 1.3 Crear modelo `ProductoCategoria` con `product_id`, `category_id`, UNIQUE compuesta
- [x] 1.4 Crear modelo `Ingrediente` con `id`, `nombre` (unique), `es_alergeno` (bool), `created_at`, `updated_at`, `deleted_at`
- [x] 1.5 Crear modelo `ProductoIngrediente` con `product_id`, `ingrediente_id`, `es_removible` (bool), UNIQUE compuesta
- [x] 1.6 Quitar `category_id` FK del modelo Product y reemplazar por relación M2M via `ProductoCategoria`
- [x] 1.7 Generar migración Alembic: crear tablas `productocategoria`, `ingrediente`, `productoingrediente`
- [x] 1.8 Generar migración Alembic: migrar datos existentes de `product.category_id` a `productocategoria`, luego dropear columna `category_id` de product
- [x] 1.9 Generar migración Alembic: agregar columnas `disponible`, `imagen_url` a product

## 2. Módulo Ingredientes (Backend)

- [x] 2.1 Crear `app/modules/ingredientes/` con estructura feature-first: `__init__.py`, `model.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`
- [x] 2.2 Implementar `IngredienteRepository` heredando de `BaseRepository[Ingrediente]`
- [x] 2.3 Implementar `IngredienteService` con CRUD y validación de nombre único
- [x] 2.4 Implementar router con endpoints CRUD protegidos por rol ADMIN: POST/GET/PUT/DELETE `/api/v1/ingredientes`
- [x] 2.5 Implementar endpoint PUT `/api/v1/productos/{id}/ingredientes` para reemplazar ingredientes del producto (M2M)
- [x] 2.6 Registrar `ingredientes` router en `app/modules/router.py`

## 3. Módulo Productos — Refactor Backend

- [x] 3.1 Refactorizar `ProductRepository` para heredar de `BaseRepository[Product]`
- [x] 3.2 Agregar métodos `search_by_name(query)` (ILIKE), `filter_by_category(category_id)`, `count_by_filters()`
- [x] 3.3 Actualizar `ProductService.create()` para recibir `category_ids` y crear asociaciones M2M
- [x] 3.4 Actualizar `ProductService.update()` para reemplazar categorías M2M atómicamente
- [x] 3.5 Implementar método `set_ingredients(product, ingredients_data)` en service
- [x] 3.6 Actualizar esquemas: `ProductCreate` con `category_ids: list[int]`, `ProductRead` con `categories: list[CategoryReadShort]` e `ingredients: list[IngredientReadShort]`
- [x] 3.7 Actualizar GET `/api/v1/productos` con paginación (skip/limit), búsqueda (search), filtro por categoría, y conteo total
- [x] 3.8 Endpoint `PATCH /api/v1/productos/{id}/stock` para actualización atómica de stock (rol ADMIN/STOCK)
- [x] 3.9 Actualizar router existente para usar nuevos schemas y services

## 4. Frontend — API Layer y Store

- [x] 4.1 Crear `features/products/api.ts` con hooks TanStack Query: `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useUpdateStock`
- [x] 4.3 Crear `features/ingredients/api.ts` con hooks TanStack Query: `useIngredients`, `useCreateIngredient`, `useUpdateIngredient`, `useDeleteIngredient`
- [x] 4.4 Actualizar `features/products/widgets/ProductForm.tsx` para usar `category_ids` multi-select en lugar de `category_id` single

## 5. Frontend — Catálogo Público

- [x] 5.1 Crear página pública `pages/catalog/index.tsx` con listado paginado de productos (solo disponibles)
- [x] 5.2 Agregar filtro por categoría y búsqueda por nombre en catálogo público
- [x] 5.3 Agregar skeleton loaders y estado vacío en catálogo
- [x] 5.4 Crear página `pages/catalog/[id].tsx` con detalle de producto incluyendo categorías e ingredientes con badge de alérgenos
- [x] 5.5 Registrar rutas de catálogo en `app/router/AppRouter.tsx`

## 6. Frontend — Gestión de Productos (Admin/Stock)

- [x] 6.1 Crear página `pages/admin/products/index.tsx` con listado de productos (incluye no disponibles, con paginación)
- [x] 6.2 Crear página `pages/admin/products/new.tsx` con formulario de creación (multi-select categorías, select ingredientes)
- [x] 6.3 Crear página `pages/admin/products/[id]/edit.tsx` con formulario de edición
- [x] 6.4 Agregar columna de stock y botón de actualización rápida en listado de gestión
- [x] 6.5 Registrar rutas de gestión en AppRouter con ProtectedRoute (roles ADMIN/STOCK)

## 7. Frontend — Gestión de Ingredientes

- [x] 7.1 Crear página `pages/admin/ingredients/index.tsx` con listado CRUD de ingredientes
- [x] 7.2 Crear formulario de ingrediente con toggle de alérgeno
- [x] 7.3 Registrar rutas de ingredientes en AppRouter con ProtectedRoute (rol ADMIN)

## 8. Tests

- [x] 8.1 Tests de backend: `tests/modules/productos/` — crear producto, actualizar, soft delete, categorías M2M, ingredientes M2M
- [x] 8.2 Tests de backend: `tests/modules/ingredientes/` — CRUD ingredientes, validación nombre único, soft delete
- [x] 8.3 Tests de backend: catálogo público — paginación, filtros, búsqueda, exclusión de no disponibles/eliminados
- [ ] 8.4 Tests de frontend: catálogo público — listado paginado, detalle, filtros
- [ ] 8.5 Tests de frontend: formulario de producto con multi-select categorías y select ingredientes
