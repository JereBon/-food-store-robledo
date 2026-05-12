## ADDED Requirements

### Requirement: Admin can create category
Only administrators can create new categories. System SHALL validate that category name is unique and generate a URL-safe slug.

#### Scenario: Admin creates new category successfully
- **WHEN** admin submits POST `/api/categories` with name "Frutas" and optional description
- **THEN** system creates category with auto-generated slug "frutas", returns 201 with category ID, name, slug, description, created_at

#### Scenario: Non-admin attempts to create category
- **WHEN** non-admin user submits POST `/api/categories`
- **THEN** system returns 403 Forbidden

#### Scenario: Duplicate category name
- **WHEN** admin attempts to create category with name that already exists
- **THEN** system returns 400 Bad Request with error message "Category name already exists"

### Requirement: Admin can read all categories
System SHALL provide endpoint to retrieve all categories (both soft-deleted and active). Admins see all; regular users see only non-deleted.

#### Scenario: Admin retrieves all categories
- **WHEN** admin submits GET `/api/categories`
- **THEN** system returns 200 with list of all categories (including soft-deleted), pagination optional

#### Scenario: Regular user retrieves categories
- **WHEN** regular user submits GET `/api/categories`
- **THEN** system returns 200 with list of non-deleted categories only

### Requirement: Admin can read single category
System SHALL return details of a specific category by ID.

#### Scenario: Admin retrieves category by ID
- **WHEN** admin submits GET `/api/categories/{id}`
- **THEN** system returns 200 with category details (id, name, slug, description, created_at, updated_at, deleted_at)

#### Scenario: Category not found
- **WHEN** user requests GET `/api/categories/{non-existent-id}`
- **THEN** system returns 404 Not Found

### Requirement: Admin can update category
Only administrators can update existing categories. System SHALL validate slug uniqueness on update.

#### Scenario: Admin updates category name and description
- **WHEN** admin submits PUT `/api/categories/{id}` with new name "Verduras" and description "Productos frescos"
- **THEN** system updates category, regenerates slug to "verduras", returns 200 with updated category

#### Scenario: Update with duplicate name
- **WHEN** admin attempts to update category to name that already exists (excluding current category)
- **THEN** system returns 400 Bad Request with error "Category name already exists"

#### Scenario: Non-admin attempts to update
- **WHEN** non-admin user submits PUT `/api/categories/{id}`
- **THEN** system returns 403 Forbidden

### Requirement: Admin can delete category (soft delete)
System SHALL implement soft delete: set `deleted_at` timestamp, do not remove record. Products referencing deleted category remain intact.

#### Scenario: Admin deletes category
- **WHEN** admin submits DELETE `/api/categories/{id}`
- **THEN** system sets `deleted_at` to current timestamp, returns 204 No Content

#### Scenario: Non-admin attempts to delete
- **WHEN** non-admin user submits DELETE `/api/categories/{id}`
- **THEN** system returns 403 Forbidden

#### Scenario: Deleted category is excluded from public list
- **WHEN** regular user retrieves GET `/api/categories` after category is soft-deleted
- **THEN** deleted category does not appear in results

### Requirement: Category model has required fields
System SHALL enforce the following schema:

#### Scenario: Create category with valid fields
- **WHEN** admin creates category with name (max 100 chars), optional description (max 500 chars)
- **THEN** system stores all fields and auto-generates slug (url-safe, max 100 chars)

#### Scenario: Name validation
- **WHEN** admin attempts to create category with missing name or name exceeding 100 characters
- **THEN** system returns 400 Bad Request with field validation error

### Requirement: Slug is unique and auto-generated
System SHALL generate URL-safe slug from category name (lowercase, hyphens for spaces, no special chars). Slug SHALL be unique across all categories (including soft-deleted).

#### Scenario: Slug auto-generated from name
- **WHEN** admin creates category with name "Productos Frescos"
- **THEN** system generates slug "productos-frescos"

#### Scenario: Slug conflict handled
- **WHEN** attempting to create category with name that generates existing slug
- **THEN** system appends numeric suffix, e.g. "productos-frescos-1"
