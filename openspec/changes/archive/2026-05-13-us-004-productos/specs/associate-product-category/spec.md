## MODIFIED Requirements

### Requirement: Associate product to categories (M2M)
System SHALL allow associating a product to multiple categories via the `ProductoCategoria` pivot table. The existing `category_id` FK field on Product SHALL be removed.

#### Scenario: Associate product to multiple categories on creation
- **WHEN** admin creates new product with `category_ids: [1, 2, 3]`
- **THEN** system creates associations in ProductoCategoria and returns 201 with product including `categories: [{id, name, slug}]`

#### Scenario: Replace categories on update
- **WHEN** admin updates existing product with PUT `/api/v1/productos/{id}` and provides new `category_ids`
- **THEN** system replaces all category associations atomically and returns 200 with updated categories

#### Scenario: Remove all categories from product
- **WHEN** admin updates product with `category_ids: []`
- **THEN** system removes all associations, returns 200 with `categories: []`

#### Scenario: Invalid category ID
- **WHEN** admin attempts to associate product to non-existent category
- **THEN** system returns 400 Bad Request with error "Category not found"

### Requirement: Product can be without categories
System SHALL allow products with no category associations.

#### Scenario: Product without categories
- **WHEN** product is created with empty `category_ids` or field omitted
- **THEN** system accepts it; product remains valid with `categories: []`

### Requirement: Retrieve products by category
System SHALL provide endpoint to filter products by category through the ProductoCategoria M2M table.

#### Scenario: Filter products by category
- **WHEN** user submits GET `/api/v1/productos?category_id={id}`
- **THEN** system returns 200 with list of non-deleted, available products in that category

#### Scenario: Non-existent category returns empty list
- **WHEN** user requests GET `/api/v1/productos?category_id={non-existent-id}`
- **THEN** system returns 200 with empty list (not 404)

### Requirement: Product response includes categories info
System SHALL include categories array in product GET responses.

#### Scenario: Product GET includes categories list
- **WHEN** user retrieves GET `/api/v1/productos/{id}`
- **THEN** response includes `categories: [{id, name, slug}]` (may be empty)

#### Scenario: Product list includes categories
- **WHEN** user retrieves GET `/api/v1/productos`
- **THEN** each product in response includes `categories` field
