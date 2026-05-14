## ADDED Requirements

### Requirement: FormaPago catalog is seeded and queryable
The system SHALL provide a `forma_pago` table pre-loaded with at least 2 active payment methods: "Tarjeta de crédito" and "Tarjeta de débito". The system SHALL expose `GET /api/v1/pagos/formas-pago` returning only active forms of payment (where `activo = true`). This endpoint SHALL be accessible without authentication (public).

#### Scenario: Active payment methods returned
- **WHEN** any caller requests `GET /api/v1/pagos/formas-pago`
- **THEN** system returns list including at least "Tarjeta de crédito" and "Tarjeta de débito"

#### Scenario: Inactive payment method excluded
- **WHEN** a FormaPago record has `activo = false`
- **THEN** it is NOT included in the `GET /api/v1/pagos/formas-pago` response

### Requirement: Order references a valid active payment method
The system SHALL require `forma_pago_id` in `POST /api/v1/pedidos`. The referenced FormaPago MUST exist and have `activo = true`. If the form of payment is inactive or not found, the order SHALL be rejected with 422.

#### Scenario: Valid active forma_pago accepted
- **WHEN** client creates order with a valid active forma_pago_id
- **THEN** order is created with that forma_pago_id stored

#### Scenario: Invalid forma_pago_id rejected
- **WHEN** client sends a forma_pago_id that does not exist
- **THEN** system returns 422 validation error

#### Scenario: Inactive forma_pago rejected
- **WHEN** client sends a forma_pago_id for an inactive payment method
- **THEN** system returns 422 indicating payment method is not available
