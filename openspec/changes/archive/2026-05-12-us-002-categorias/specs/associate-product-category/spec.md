## ADDED Requirements

### Requirement: Associate product to category
System SHALL allow associating a product to a category via the product update endpoint. A product can only be associated with one category.

#### Scenario: Associate product to category on creation
- **WHEN** admin creates new product with `category_id` field
- **THEN** system stores category_id and returns 201 with product details including category information

#### Scenario: Associate product to category on update
- **WHEN** admin updates existing product with PATCH `/api/products/{id}` and provides `category_id`
- **THEN** system updates product.category_id and returns 200 with updated product

#### Scenario: Invalid category ID
- **WHEN** admin attempts to associate product to non-existent category
- **THEN** system returns 400 Bad Request with error "Category not found"

### Requirement: Product can be unassociated from category
System SHALL allow removing category association from a product by setting category_id to null.

#### Scenario: Remove category from product
- **WHEN** admin updates product with `category_id: null`
- **THEN** system removes category association, product.category_id becomes null, returns 200

#### Scenario: Product without category
- **WHEN** product is created without category_id
- **THEN** system accepts it; category_id is null, product remains valid

### Requirement: Retrieve products by category
System SHALL provide endpoint to filter products by category.

#### Scenario: Filter products by category
- **WHEN** user submits GET `/api/products?category_id={id}`
- **THEN** system returns 200 with list of non-deleted products in that category

#### Scenario: Filter includes pagination
- **WHEN** user submits GET `/api/products?category_id={id}&limit=10&offset=0`
- **THEN** system returns paginated results of products in category

#### Scenario: Non-existent category returns empty list
- **WHEN** user requests GET `/api/products?category_id={non-existent-id}`
- **THEN** system returns 200 with empty list (not 404)

### Requirement: Product response includes category info
System SHALL include category information in product GET responses.

#### Scenario: Product GET includes category
- **WHEN** user retrieves GET `/api/products/{id}`
- **THEN** response includes `category_id` and optionally category object with id, name, slug

#### Scenario: Product list includes category
- **WHEN** user retrieves GET `/api/products` (list)
- **THEN** each product in response includes `category_id`

### Requirement: Prevent deletion of category with active products
System SHALL not allow deleting (even soft delete) a category that has non-deleted products associated with it.

#### Scenario: Attempt to delete category with products
- **WHEN** admin attempts DELETE `/api/categories/{id}` where category has active products
- **THEN** system returns 400 Bad Request with error "Cannot delete category with active products"

#### Scenario: Delete category with no products
- **WHEN** admin attempts DELETE `/api/categories/{id}` where category has no active products
- **THEN** system soft-deletes category, returns 204 No Content
