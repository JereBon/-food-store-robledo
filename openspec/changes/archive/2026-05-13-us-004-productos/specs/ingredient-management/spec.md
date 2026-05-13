## ADDED Requirements

### Requirement: Create ingredient
The system SHALL allow ADMIN to create ingredients with name and es_alergeno flag.

#### Scenario: Admin creates ingredient
- **WHEN** ADMIN sends POST `/api/v1/ingredientes` with name and es_alergeno
- **THEN** system returns 201 with created ingredient

#### Scenario: Duplicate ingredient name rejected
- **WHEN** ADMIN attempts to create ingredient with existing name
- **THEN** system returns 400 Bad Request

#### Scenario: Create ingredient defaults es_alergeno to false
- **WHEN** ADMIN creates ingredient without es_alergeno flag
- **THEN** system sets es_alergeno=false, returns 201

### Requirement: List ingredients
The system SHALL provide endpoint to list all non-deleted ingredients with optional filter by es_alergeno.

#### Scenario: List all ingredients
- **WHEN** user sends GET `/api/v1/ingredientes`
- **THEN** system returns 200 with list of non-deleted ingredients

#### Scenario: Filter by allergen
- **WHEN** user sends GET `/api/v1/ingredientes?es_alergeno=true`
- **THEN** system returns only ingredients with es_alergeno=true

### Requirement: Update ingredient
The system SHALL allow ADMIN to update ingredient name and es_alergeno flag.

#### Scenario: Admin updates ingredient
- **WHEN** ADMIN sends PUT `/api/v1/ingredientes/{id}` with updated fields
- **THEN** system returns 200 with updated ingredient

### Requirement: Soft delete ingredient
The system SHALL allow ADMIN to soft-delete ingredients.

#### Scenario: Admin soft-deletes ingredient
- **WHEN** ADMIN sends DELETE `/api/v1/ingredientes/{id}`
- **THEN** system sets deleted_at, returns 204

### Requirement: Associate ingredients to product (M2M)
The system SHALL allow associating multiple ingredients to a product via ProductoIngrediente pivot table with es_removible flag.

#### Scenario: Admin sets product ingredients
- **WHEN** ADMIN sends PUT `/api/v1/productos/{id}/ingredientes` with array of `{ingredient_id, es_removible}`
- **THEN** system replaces all ingredient associations atomically, returns 200

#### Scenario: Product response includes ingredients
- **WHEN** user retrieves GET `/api/v1/productos/{id}`
- **THEN** response includes `ingredients: [{id, name, es_alergeno, es_removible}]`

#### Scenario: Ingredient marked as allergen is highlighted
- **WHEN** ingredient has es_alergeno=true
- **THEN** response includes es_alergeno flag for frontend to highlight
