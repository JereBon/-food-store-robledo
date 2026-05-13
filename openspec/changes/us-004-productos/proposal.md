## Why

El módulo `productos` tiene backend CRUD básico y un `ProductForm` en frontend, pero está incompleto frente a la especificación v5: faltan ingredientes con alérgenos, relación M2M con categorías, campo `disponible`, imágenes, el catálogo público con paginación/búsqueda, y la gestión de stock. Sin estas funcionalidades, el core del negocio (catálogo, carrito, pedidos) no puede operar.

## What Changes

- **Modelo Producto**: agregar `disponible` (bool), `imagen_url` (opcional), migrar `category_id` FK directa a tabla pivote `ProductoCategoria` (M2M)
- **Módulo Ingredientes**: crear modelo `Ingrediente` con `es_alergeno`, CRUD completo, y tabla pivote `ProductoIngrediente` (M2M)
- **API Pública**: GET `/api/v1/productos` con paginación, filtros por categoría/búsqueda, excluyendo no disponibles y soft-delete
- **Frontend Catálogo**: página pública de productos con listado paginado, detalle de producto, skeleton loaders
- **Frontend Gestión**: páginas para crear/editar productos con selector de categorías M2M e ingredientes, gestión de stock
- **Stock PATCH**: endpoint `PATCH /api/v1/productos/{id}/stock` para actualización atómica de stock
- **BREAKING**: `category_id` en Producto se reemplaza por tabla `ProductoCategoria` M2M — requiere migración de datos y actualización de código existente

## Capabilities

### New Capabilities
- `product-crud`: CRUD completo de productos con imagen, disponibilidad, precio DECIMAL, stock — backend + frontend de gestión
- `ingredient-management`: CRUD de ingredientes con flag de alérgeno, tabla pivote ProductoIngrediente — backend + frontend
- `product-catalog-public`: Catálogo público con listado paginado, búsqueda, filtro por categoría, detalle de producto con ingredientes y alérgenos
- `product-stock`: Endpoint de actualización atómica de stock, visible en frontend de gestión

### Modified Capabilities
- `backend-foundation`: Requisito de módulo `productos` scaffold se cumple. Agregar requisito de `ingredientes` como módulo feature-first. El `BaseRepository` debe servir como base para `ProductRepository` e `IngredienteRepository`
- `associate-product-category`: Cambia de FK directa a M2M via `ProductoCategoria`. Requiere migración y actualización de servicios/routers existentes

## Impact

- **Backend**: `app/modules/productos/` — modificar model, repository, service, router, schemas. Crear `app/modules/ingredientes/` completo. Migración Alembic para `ProductoCategoria` y `ProductoIngrediente`
- **Frontend**: `features/products/` — agregar API layer (TanStack Query), página de listado, detalle, formulario de gestión con M2M. Crear `features/ingredients/`. Routing en `pages/`
- **BD**: Nueva tabla `productocategoria`, `ingrediente`, `productoingrediente`. Migración de datos de `category_id` a `ProductoCategoria`
- **Tests**: Tests de backend para productos e ingredientes. Tests de frontend para nuevas páginas y flujos
