## ADDED Requirements

### Requirement: Update product stock atomically
The system SHALL provide an endpoint for ADMIN and STOCK roles to update product stock with atomic operations.

#### Scenario: Set stock to absolute value
- **WHEN** STOCK user sends PATCH `/api/v1/productos/{id}/stock` with `{cantidad: 50}`
- **THEN** system sets product stock to 50 atomically, returns 200

#### Scenario: Reject negative stock
- **WHEN** STOCK user attempts to set stock to -1
- **THEN** system returns 422 validation error

#### Scenario: Non-existent product returns 404
- **WHEN** STOCK user sends PATCH for non-existent product ID
- **THEN** system returns 404 Not Found

### Requirement: Product stock visible in management UI
The system SHALL display current stock in product management pages and allow inline stock updates.

#### Scenario: Stock shown in product detail
- **WHEN** ADMIN views product detail in management page
- **THEN** current stock is displayed

#### Scenario: Stock update reflects immediately
- **WHEN** STOCK user updates stock
- **THEN** subsequent product GET returns updated stock value
