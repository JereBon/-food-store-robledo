## Context

Food Store es una aplicación e-commerce construida con:
- **Backend**: FastAPI + SQLModel + PostgreSQL, arquitectura Feature-First (módulos verticales)
- **Frontend**: React 18 + TypeScript + Vite, Feature-Sliced Design

Actualmente, los productos no tienen categorización, lo que limita la navegación. Este diseño introduce una nueva entidad `Category` que permite organizar productos por categorías y mejorar la experiencia de usuario.

## Goals / Non-Goals

**Goals:**
- Implementar un modelo `Category` en la base de datos con atributos básicos (nombre, descripción, slug único)
- Crear endpoints CRUD para categorías en el backend (`GET /api/categories`, `POST /api/categories`, `PUT /api/categories/{id}`, `DELETE /api/categories/{id}`)
- Permitir asociar un producto a una categoría (relación one-to-many: Category → Products)
- Implementar componentes en frontend para visualizar y gestionar categorías
- Permitir filtrar productos por categoría en el catálogo

**Non-Goals:**
- Subcategorías (solo un nivel de categorización)
- Búsqueda avanzada (búsqueda basic por categoría está fuera de alcance)
- Carga masiva de categorías (bulk import)
- Historial de cambios en categorías

## Decisions

### 1. Modelo de Datos - Relación Category-Product
**Decision**: One-to-Many (una categoría puede tener muchos productos, un producto pertenece a una categoría)
**Rationale**: 
- Simplifica la lógica de negocio inicial
- Evita tabla de unión (junction table)
- Alineado con patrones comunes en e-commerce

**Alternatives Considered**:
- Many-to-Many: permitiría que un producto tenga múltiples categorías, pero agrega complejidad sin requerimiento claro

### 2. Estructura de Backend - Módulo Vertical
**Decision**: Crear módulo `app/modules/categorias/` siguiendo patrón Feature-First
- `models.py`: Modelo SQLModel `Category`
- `schemas.py`: Pydantic schemas para request/response
- `router.py`: Endpoints CRUD
- `service.py`: Lógica de negocio (validaciones, búsquedas)
- `repository.py`: Acceso a datos

**Rationale**: 
- Mantiene consistencia con arquitectura existente
- Aislamiento de cambios
- Facilita testing y mantenimiento

### 3. Validaciones y Constraints
**Decision**: 
- `name`: Required, max 100 caracteres, unique
- `slug`: Auto-generado desde `name` (url-safe), unique
- `description`: Optional, max 500 caracteres
- Soft delete (`deleted_at`) para no perder referencia histórica

**Rationale**: 
- Slug permite URLs limpias y SEO-friendly
- Soft delete alineado con política de auditoría del proyecto
- Constraints previenen duplicados

### 4. Transacciones - Unit of Work (UoW)
**Decision**: Usar patrón UnitOfWork para manejar transacciones
- El Service orquesta la lógica, pero NO hace commit
- El Router (o UoW middleware) maneja commit/rollback

**Rationale**: 
- Mantiene consistencia con arquitectura existente
- Rollback automático en caso de error

### 5. Frontend - Feature-Sliced Design
**Decision**: Crear feature `categories` bajo `src/features/` con estructura:
- `pages/`: Páginas (CategoriesPage, CategoryDetailPage)
- `widgets/`: Componentes complejos (CategoryList, CategoryForm)
- `entities/`: Tipos TypeScript (ICategory)
- `api.ts`: Hooks TanStack Query para datos

**Rationale**: 
- Mantiene Feature-Sliced Design
- Separación clara de responsabilidades
- Reutilizable desde otros features (e.g., product form)

### 6. State Management
**Decision**: 
- TanStack Query EXCLUSIVO para datos del servidor (lista de categorías, detalles)
- Zustand SOLO si hay estado local del UI (modales, filtros activos)

**Rationale**: 
- Alineado con guardrails del proyecto
- TanStack Query maneja caching, refetch, invalidation

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Cambiar modelo Product (agregar `category_id`) puede romper migraciones existentes | Crear migration Alembic cuidadosamente; hacer `category_id` optional inicialmente |
| One-to-Many puede ser restrictivo si en futuro se necesitan múltiples categorías por producto | Documentar decisión; en v2 se puede migrar a Many-to-Many si es necesario |
| Cascade delete: ¿qué pasa si elimino una categoría con productos? | Implementar soft delete; productos mantienen referencia a categoría; se puede agregar validación para no eliminar categoría con productos activos |
| Performance: ¿filtrar productos por categoría puede ser lento con muchos datos? | Usar índice en `product.category_id`; agregar pagination |

## Migration Plan

1. **Backend**:
   - Crear migration Alembic para nueva tabla `categories`
   - Crear migration para agregar `category_id` a `products` (con constraint nullable)
   - Crear índice en `product.category_id`

2. **Frontend**:
   - Agregar componente CategorySelect en ProductForm
   - Agregar página de gestión de categorías (admin only)

3. **Rollback**:
   - Revertir migrations si es necesario
   - Eliminar componentes de frontend

## Decisiones Cerradas (Open Questions Resueltas)

- ✅ **Acceso CRUD**: Solo administradores pueden crear/editar/eliminar categorías. Endpoint `GET /api/categories` público.
- ✅ **Imagen/Ícono**: No requerido en esta iteración. Mantiene modelo simple.
- ✅ **Orden**: Sin orden específico por ahora. Las categorías se devuelven en orden de creación (u orden alfabético opcional en v2).
