## ADDED Requirements

### Requirement: Create product with all required fields
The system SHALL allow ADMIN and STOCK roles to create products with name, description, price (Decimal), stock, disponible, imagen_url, and optional category associations (M2M via ProductoCategoria).

#### Scenario: Admin creates product with all fields
- **WHEN** ADMIN sends POST `/api/v1/productos` with valid product data including categories
- **THEN** system returns 201 with created product including category list

#### Scenario: STOCK role can create product
- **WHEN** STOCK user sends POST `/api/v1/productos` with valid data
- **THEN** system returns 201 with created product

#### Scenario: CLIENT cannot create product
- **WHEN** CLIENT sends POST `/api/v1/productos`
- **THEN** system returns 403 Forbidden

#### Scenario: Product without categories is valid
- **WHEN** ADMIN creates product without categories
- **THEN** system returns 201 with product having empty category list

#### Scenario: Reject product with non-existent category
- **WHEN** ADMIN creates product with non-existent category_id
- **THEN** system returns 400 Bad Request

#### Scenario: Reject product with price <= 0
- **WHEN** ADMIN creates product with price <= 0
- **THEN** system returns 422 validation error

### Requirement: Update product with partial data
The system SHALL allow ADMIN and STOCK to update any subset of product fields, including categories M2M.

#### Scenario: Admin updates product name and price
- **WHEN** ADMIN sends PUT `/api/v1/productos/{id}` with name and price only
- **THEN** system returns 200 with updated product; other fields unchanged

#### Scenario: Admin updates product categories (full replacement)
- **WHEN** ADMIN sends PUT `/api/v1/productos/{id}` with new category_ids array
- **THEN** system replaces all category associations atomically, returns 200

#### Scenario: Admin removes all categories from product
- **WHEN** ADMIN sends PUT `/api/v1/productos/{id}` with empty categories array
- **THEN** system removes all category associations, returns 200

### Requirement: Soft delete product
The system SHALL soft-delete products by setting `deleted_at` timestamp.

#### Scenario: Admin soft-deletes product
- **WHEN** ADMIN sends DELETE `/api/v1/productos/{id}`
- **THEN** system sets deleted_at, returns 204

#### Scenario: Soft-deleted product excluded from queries
- **WHEN** any user lists products after soft-delete
- **THEN** deleted product does not appear in results

#### Scenario: Admin can view deleted products
- **WHEN** ADMIN lists products with `include_deleted=true`
- **THEN** deleted products appear in results

### Requirement: Product response includes nested category list
The system SHALL return categories as an array of `{id, name, slug}` in product GET responses.

#### Scenario: Product GET returns categories array
- **WHEN** user retrieves GET `/api/v1/productos/{id}`
- **THEN** response includes `categories: [{id, name, slug}]`

#### Scenario: Product with no categories returns empty array
- **WHEN** user retrieves product without categories
- **THEN** response includes `categories: []`
