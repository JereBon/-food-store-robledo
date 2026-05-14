## MODIFIED Requirements

### Requirement: Update product stock atomically
The system SHALL provide an endpoint for ADMIN and STOCK roles to update product stock with atomic operations. Stock is also decremented automatically when an order transitions from PENDIENTE to CONFIRMADO (payment approved). Stock is validated but NOT decremented at order creation time (RN-FS02).

#### Scenario: Set stock to absolute value
- **WHEN** STOCK user sends PATCH `/api/v1/productos/{id}/stock` with `{cantidad: 50}`
- **THEN** system sets product stock to 50 atomically, returns 200

#### Scenario: Reject negative stock
- **WHEN** STOCK user attempts to set stock to -1
- **THEN** system returns 422 validation error

#### Scenario: Non-existent product returns 404
- **WHEN** STOCK user sends PATCH for non-existent product ID
- **THEN** system returns 404 Not Found

#### Scenario: Stock not decremented at order creation
- **WHEN** client creates an order with 2 units of product A (stock = 10)
- **THEN** product A stock remains 10 until the payment is approved

#### Scenario: Stock decremented when payment approved
- **WHEN** MercadoPago approves payment for an order containing 2 units of product A (stock = 10)
- **THEN** product A stock becomes 8 within the same transaction that records the payment
