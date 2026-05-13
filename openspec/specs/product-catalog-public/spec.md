## ADDED Requirements

### Requirement: Public catalog lists available products with pagination
The system SHALL provide a public endpoint to list products with `disponible=true` and `deleted_at IS NULL`, with pagination metadata.

#### Scenario: Browse catalog paginated
- **WHEN** any user sends GET `/api/v1/productos?skip=0&limit=20`
- **THEN** system returns 200 with `{items: [...], total: int, skip: 0, limit: 20}`

#### Scenario: Only available products shown
- **WHEN** any user browses catalog
- **THEN** products with `disponible=false` are excluded

#### Scenario: Soft-deleted products excluded
- **WHEN** any user browses catalog
- **THEN** products with `deleted_at IS NOT NULL` are excluded

#### Scenario: Second page returns remaining items
- **WHEN** user sends GET `/api/v1/productos?skip=20&limit=20`
- **THEN** system returns next 20 items (or fewer if end reached)

### Requirement: Filter catalog by category
The system SHALL filter catalog products by category_id through ProductoCategoria M2M.

#### Scenario: Filter by single category
- **WHEN** user sends GET `/api/v1/productos?category_id=5`
- **THEN** system returns products associated with category 5

#### Scenario: Non-existent category returns empty list
- **WHEN** user sends GET `/api/v1/productos?category_id=999999`
- **THEN** system returns 200 with empty items array

### Requirement: Search catalog by name
The system SHALL support case-insensitive partial name search via ILIKE.

#### Scenario: Search products by name
- **WHEN** user sends GET `/api/v1/productos?search=pizza`
- **THEN** system returns products whose name contains "pizza" (case-insensitive)

#### Scenario: No matches returns empty
- **WHEN** user sends GET `/api/v1/productos?search=zzzznonexistent`
- **THEN** system returns 200 with empty items array

### Requirement: Public product detail
The system SHALL provide a public endpoint for full product detail including categories and ingredients.

#### Scenario: View product detail
- **WHEN** any user sends GET `/api/v1/productos/{id}`
- **THEN** system returns 200 with product including categories, ingredients, and disponibilidad

#### Scenario: Non-available product returns 404
- **WHEN** user requests detail of product with `disponible=false`
- **THEN** system returns 404 Not Found

#### Scenario: Deleted product returns 404
- **WHEN** user requests detail of soft-deleted product
- **THEN** system returns 404 Not Found
