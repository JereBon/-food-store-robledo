## 1. Database Migrations

- [x] 1.1 Create Alembic migration for new `categories` table with columns: id, name, slug (unique), description, created_at, updated_at, deleted_at
- [x] 1.2 Create Alembic migration to add `category_id` (nullable FK) to `products` table
- [x] 1.3 Create index on `products.category_id` for query performance

## 2. Backend - Category Module

- [x] 2.1 Create `app/modules/categorias/models.py` with SQLModel `Category` entity
- [x] 2.2 Create `app/modules/categorias/schemas.py` with Pydantic schemas (CategoryCreate, CategoryRead, CategoryUpdate)
- [x] 2.3 Create `app/modules/categorias/repository.py` with methods: create, read, read_all, update, delete_soft, get_by_id, get_by_slug, check_has_products
- [x] 2.4 Create `app/modules/categorias/service.py` with business logic: validate_unique_name, generate_slug, handle_create, handle_update, handle_delete_with_validation
- [x] 2.5 Create `app/modules/categorias/router.py` with endpoints: POST /api/categories (admin), GET /api/categories (public), GET /api/categories/{id} (public), PUT /api/categories/{id} (admin), DELETE /api/categories/{id} (admin)
- [x] 2.6 Integrate router into main FastAPI app and UnitOfWork

## 3. Backend - Product Module Updates

- [x] 3.1 Update `Product` model in `app/modules/productos/models.py` to include `category_id` foreign key (nullable)
- [x] 3.2 Update schemas in `app/modules/productos/schemas.py` to include `category_id` in ProductCreate and ProductRead
- [x] 3.3 Update product repository to support filtering by category_id and validate category exists on create/update
- [x] 3.4 Update product service to handle category association and dissociation
- [x] 3.5 Update product router to support `?category_id={id}` query param for filtering by category
- [x] 3.6 Update product responses to include category info (id, name, slug) when available

## 4. Frontend - Category Types & API

- [x] 4.1 Create `src/entities/category.ts` with TypeScript interfaces (ICategory, ICategoryCreate, ICategoryUpdate)
- [x] 4.2 Create `src/features/categories/api.ts` with TanStack Query hooks (useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory)
- [x] 4.3 Implement `useCategories` hook to fetch all non-deleted categories (public endpoint)
- [x] 4.4 Implement `useCreateCategory` mutation with admin-only error handling (403)
- [x] 4.5 Implement `useUpdateCategory` mutation with admin-only error handling
- [x] 4.6 Implement `useDeleteCategory` mutation with error handling for categories with products

## 5. Frontend - Category Components

- [x] 5.1 Create `src/features/categories/widgets/CategoryList.tsx` to display categories table with name, slug, description
- [x] 5.2 Create `src/features/categories/widgets/CategoryForm.tsx` for create/edit form with validation
- [x] 5.3 Create `src/features/categories/widgets/CategorySelect.tsx` dropdown component for selecting category in product forms
- [x] 5.4 Create `src/features/categories/pages/CategoriesPage.tsx` admin page with list and action buttons (create, edit, delete)
- [x] 5.5 Integrate CategorySelect into ProductForm component (create and edit product)

## 6. UI/UX & Routing

- [x] 6.1 Add route `/admin/categories` for CategoriesPage (protected, admin-only)
- [x] 6.2 Update sidebar/navigation to include link to Categories management (admin-only)
- [x] 6.3 Add modal or page for category creation/editing with form validation
- [x] 6.4 Add delete confirmation dialog with warning if category has products

## 7. Testing - Backend

- [x] 7.1 Write pytest tests for category router: POST, GET list, GET single, PUT, DELETE
- [x] 7.2 Write pytest tests for category service: unique name validation, slug generation, conflict handling
- [x] 7.3 Write pytest tests for product-category association: associate, disassociate, filter by category
- [x] 7.4 Write pytest tests for category deletion: prevent delete if has products, allow if empty
- [x] 7.5 Verify soft delete behavior: deleted categories excluded from public list

## 8. Testing - Frontend

- [x] 8.1 Write vitest tests for CategorySelect component (render, select, change)
- [x] 8.2 Write vitest tests for CategoryForm component (validation, submit, edit mode)
- [x] 8.3 Write @testing-library/react tests for CategoriesPage (list render, create, edit, delete)
- [x] 8.4 Write integration tests for product form with category selection
- [x] 8.5 Verify error handling: show 403 for non-admin, show error for duplicate names

## 9. Documentation & Cleanup

- [x] 9.1 Update API documentation / OpenAPI schema with category endpoints
- [x] 9.2 Update README or ARCHITECTURE.md with new module structure
- [x] 9.3 Run linter (ruff, eslint) and fix any issues
- [x] 9.4 Run type checker (mypy, tsc) and ensure no errors
- [x] 9.5 Verify all tests pass and coverage is acceptable
