## MODIFIED Requirements

### Requirement: Order creation is atomic via Unit of Work
The system SHALL create a new order atomically: `Pedido`, all `DetallePedido` items, and the initial `HistorialEstadoPedido` record MUST be persisted in a single database transaction. If any part fails, nothing is persisted. The `PedidoCreate` request MUST include `forma_pago_id` referencing an active FormaPago.

#### Scenario: Successful order creation persists all records
- **WHEN** client sends `POST /api/v1/pedidos` with a valid address ID, valid forma_pago_id, and cart items
- **THEN** system creates Pedido, DetallePedido records, and HistorialEstadoPedido in one transaction and returns 201 with the new order

#### Scenario: Partial failure rolls back everything
- **WHEN** an error occurs while inserting a DetallePedido item
- **THEN** system rolls back the entire transaction and returns 500; no Pedido record is persisted

### Requirement: Stock is validated at order creation but NOT decremented
The system SHALL validate stock availability for each item using a locking query (SELECT FOR UPDATE) inside the order creation transaction before any INSERT. If any product has insufficient stock, the entire order is rejected. However, stock SHALL NOT be decremented at order creation — it is only decremented when the payment is approved (PENDIENTE→CONFIRMADO transition, RN-FS02).

#### Scenario: Sufficient stock allows order creation without decrementing stock
- **WHEN** all cart items have stock >= requested quantity
- **THEN** order is created successfully AND product stock values remain unchanged

#### Scenario: Insufficient stock rejects the entire order
- **WHEN** one item has requested quantity 3 but only 2 in stock
- **THEN** system returns 422 with details of the failing product; no order records are created

#### Scenario: Concurrent request cannot oversell
- **WHEN** two concurrent requests try to order the last unit of the same product
- **THEN** only one succeeds; the other receives a 422 insufficient stock error
