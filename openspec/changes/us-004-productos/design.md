## Context

El módulo `productos` fue creado en el scaffold inicial (US-000) con la estructura feature-first básica, pero nunca se completó. Tiene:

- Modelo Producto con `category_id` FK directa y `price` como float en Python
- Repository propio (no extiende BaseRepository)
- Router con CRUD básico protegido por roles
- Frontend: solo `ProductForm` widget, sin API layer ni páginas
- Migración 0004 con tabla `product`

La especificación v5 requiere: M2M con categorías, ingredientes con alérgenos, campo `disponible`, imágenes, catálogo público paginado, y gestión de stock atómica.

## Goals / Non-Goals

**Goals:**
- Migrar de FK directa `category_id` a M2M via `ProductoCategoria` con migración de datos
- Agregar `disponible`, `imagen_url` al modelo Producto, y corregir `price` a `Decimal`
- Crear módulo `ingredientes` completo (modelo, CRUD, M2M con productos)
- Implementar catálogo público con paginación, búsqueda y filtros
- Agregar endpoint `PATCH /api/v1/productos/{id}/stock` para actualización atómica
- Refactorizar `ProductRepository` para heredar de `BaseRepository`
- Frontend completo: API layer (TanStack Query), páginas de catálogo, detalle, gestión

**Non-Goals:**
- No se implementan imágenes (upload). Solo campo `imagen_url` para URL externa
- No se implementa filtrado por alérgenos en catálogo público (US-023, queda para otro change)
- No se implementa módulo de administración/dashboard (es otro change)
- No se modifica el UoW central — los repos se instancian manualmente como ya se hace

## Decisions

### D1 — M2M con tabla ProductoCategoria en lugar de FK directa
**Decisión**: Crear tabla `ProductoCategoria(product_id, category_id)` con UNIQUE compuesta. Migrar datos existentes de `category_id`.
**Alternativa**: Mantener FK directa y agregar M2M opcional. Descartado porque la especificación v5 es clara: M2M.
**Impacto**: El `ProductForm` existente usa `category_id` — habrá que migrarlo a multi-select. El endpoint PUT /products/{id} cambia.

### D2 — ProductoIngrediente con es_removible
**Decisión**: La tabla pivote incluye `es_removible: bool` para permitir personalización del pedido (el cliente puede excluir ingredientes removibles).
**Alternativa**: Flag solo en Ingrediente. Descartado porque un ingrediente puede ser removible en un producto pero no en otro.

### D3 — Precio como Decimal en Python
**Decisión**: Usar `Decimal` type de Python en el modelo SQLModel, mapeando a `NUMERIC(10,2)` en BD. Los schemas Pydantic usan `Decimal` también. Para que FastAPI serialice correctamente a JSON (por defecto Decimal se serializa como string), los schemas de response usan `model_config = ConfigDict(json_encoders={Decimal: float})`.
**Alternativa**: Mantener float. Descartado por riesgo de errores de redondeo en cálculos financieros.

### D4 — Paginación con skip/limit + total
**Decisión**: Los endpoints públicos devuelven `{ items: ProductRead[], total: int, skip: int, limit: int }`.
**Alternativa**: Cursor-based pagination. Descartado por simplicidad y consistencia con el resto del sistema.

### D5 — Catálogo público vs. gestión separados por rol
**Decisión**: Un solo endpoint GET /api/v1/productos que se comporta distinto según auth:
- Sin auth o CLIENT: solo `disponible=true` y `deleted_at IS NULL`, con paginación
- ADMIN/STOCK: puede ver no disponibles y eliminados con flag `include_deleted`
**Alternativa**: Endpoints separados. Descartado porque la diferenciación por query param ya existe en el router actual.

### D6 — BaseRepository como base de ProductRepository
**Decisión**: Refactorizar `ProductRepository` para heredar de `BaseRepository[Product]`. Agregar métodos específicos del dominio (search, filter by category, stock update).
**Alternativa**: Mantener repo independiente. Descartado por consistencia con la especificación.

## Risks / Trade-offs

- **Breaking change**: La migración de `category_id` a M2M rompe cualquier código o query que referencie `Product.category_id`. Mitigación: migración de datos en un paso, actualizar todos los referenciadores en el mismo change.
- **Decimal en schemas Pydantic**: FastAPI serializa Decimal como string por defecto. Requiere configurar `json_encoders` o usar `float` en los schemas de response. Trade-off: precisión vs. compatibilidad JSON.
- **Volumen de frontend**: Este change agrega ~4 páginas nuevas + 1 feature completa (ingredients). Es el cambio más grande hasta ahora. Mitigación: dividir tasks por feature, implementar backend primero.
