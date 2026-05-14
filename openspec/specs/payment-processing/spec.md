## ADDED Requirements

### Requirement: Backend creates MercadoPago Checkout Pro preference
The system SHALL provide `POST /api/v1/pagos/crear-preferencia` that receives a `pedido_id`, validates the order is in PENDIENTE state and belongs to the authenticated user, creates a MercadoPago preference via the Python SDK with item snapshots, `external_reference = str(pedido_id)`, and back_urls pointing to `/pago/exito`, `/pago/pendiente`, `/pago/fallo`. The endpoint SHALL return `{ preference_id, init_point }`.

#### Scenario: Preference created for valid PENDIENTE order
- **WHEN** authenticated client calls `POST /api/v1/pagos/crear-preferencia` with their own order in PENDIENTE
- **THEN** system returns 200 with `preference_id` and `init_point` URL pointing to MercadoPago

#### Scenario: Non-existent or foreign order returns 404
- **WHEN** client calls with an order ID that does not exist or belongs to another user
- **THEN** system returns 404 Not Found

#### Scenario: Order not in PENDIENTE returns 422
- **WHEN** client calls with an order already in CONFIRMADO or CANCELADO
- **THEN** system returns 422 with message indicating the order is not payable

### Requirement: Webhook endpoint receives and processes MercadoPago IPN notifications
The system SHALL provide `POST /api/v1/pagos/webhook` (public, no auth) that receives MercadoPago payment notifications. For each notification the system SHALL: (1) extract `payment_id`, (2) query the MercadoPago API to get the real payment state (RN-PA04), (3) compute `idempotency_key = f"{external_reference}-{payment_id}"`, (4) skip if a `Pago` with that key already exists (RN-PA02), (5) persist a `Pago` record, (6) if `mp_status == "approved"` transition the order PENDIENTE→CONFIRMADO within the same UoW transaction. The endpoint SHALL always return HTTP 200 immediately (RN-PA03).

#### Scenario: Approved payment triggers PENDIENTE to CONFIRMADO transition
- **WHEN** MercadoPago sends webhook with `status = "approved"` for order in PENDIENTE
- **THEN** system creates Pago record with mp_status "approved" and transitions Pedido to CONFIRMADO

#### Scenario: Rejected payment keeps order in PENDIENTE
- **WHEN** MercadoPago sends webhook with `status = "rejected"`
- **THEN** system creates Pago record with mp_status "rejected"; Pedido remains in PENDIENTE (RN-PA06)

#### Scenario: Pending payment keeps order in PENDIENTE
- **WHEN** MercadoPago sends webhook with `status = "pending"` or `"in_process"`
- **THEN** system creates Pago record; Pedido remains in PENDIENTE (RN-PA07)

#### Scenario: Duplicate webhook is ignored (idempotency)
- **WHEN** MercadoPago sends the same webhook twice (same payment_id for same order)
- **THEN** system responds 200 and does NOT create a duplicate Pago record (RN-PA02)

#### Scenario: Webhook always returns 200
- **WHEN** any valid webhook notification arrives
- **THEN** system responds with HTTP 200 immediately, regardless of internal processing outcome (RN-PA03)

### Requirement: PENDIENTE to CONFIRMADO transition decrements product stock atomically
The system SHALL decrement `Producto.stock` for every `DetallePedido` item within the same UoW transaction that records the approved payment. If any decrement would result in negative stock, the transaction SHALL roll back and log the anomaly without transitioning the order.

#### Scenario: Stock decremented on payment approval
- **WHEN** order transitions from PENDIENTE to CONFIRMADO
- **THEN** each product's stock is reduced by the ordered quantity within the same transaction

#### Scenario: Stock anomaly (stock went negative since order creation) rolls back
- **WHEN** a product's current stock is less than the ordered quantity at approval time
- **THEN** transaction rolls back; Pedido stays PENDIENTE; anomaly is logged

### Requirement: Payment history is retrievable per order
The system SHALL provide `GET /api/v1/pagos/pedido/{pedido_id}` returning all Pago records associated with the order, sorted by creation date ascending. Only the order owner may access this endpoint.

#### Scenario: Owner retrieves payment attempts
- **WHEN** authenticated client calls `GET /api/v1/pagos/pedido/1` for their own order
- **THEN** system returns list of Pago records with mp_status and timestamps

#### Scenario: Non-owner gets 403
- **WHEN** client requests payments for an order belonging to another user
- **THEN** system returns 403 Forbidden
