# order-creation Specification

## Purpose
Creación atómica de pedidos con Unit of Work, validación de stock intra-transaccional, snapshot de precio por ítem y snapshot de dirección de entrega.

## ADDED Requirements

### Requirement: Order creation is atomic via Unit of Work
The system SHALL create a new order atomically: `Pedido`, all `DetallePedido` items, and the initial `HistorialEstadoPedido` record MUST be persisted in a single database transaction. If any part fails, nothing is persisted.

#### Scenario: Successful order creation persists all records
- **WHEN** client sends `POST /api/v1/pedidos` with a valid address ID and cart items
- **THEN** system creates Pedido, DetallePedido records, and HistorialEstadoPedido in one transaction and returns 201 with the new order

#### Scenario: Partial failure rolls back everything
- **WHEN** an error occurs while inserting a DetallePedido item
- **THEN** system rolls back the entire transaction and returns 500; no Pedido record is persisted

### Requirement: Stock is validated with SELECT FOR UPDATE inside the transaction
The system SHALL validate stock availability for each item using a locking query inside the transaction before any INSERT. If any product has insufficient stock, the entire order is rejected with no records created.

#### Scenario: Sufficient stock allows order creation
- **WHEN** all cart items have stock >= requested quantity
- **THEN** order is created successfully

#### Scenario: Insufficient stock rejects the entire order
- **WHEN** one item has requested quantity 3 but only 2 in stock
- **THEN** system returns 422 with details of the failing product; no order records are created

#### Scenario: Concurrent request cannot oversell
- **WHEN** two concurrent requests try to order the last unit of the same product
- **THEN** only one succeeds; the other receives a 422 insufficient stock error

### Requirement: Price snapshot is stored per order item
The system SHALL copy the current product price into `DetallePedido.precio_unitario` at the moment of order creation. Future price changes SHALL NOT affect existing orders.

#### Scenario: Price snapshot captured at creation time
- **WHEN** order is created with a product priced at 1500.00
- **THEN** DetallePedido.precio_unitario = 1500.00 regardless of subsequent price changes

#### Scenario: Order total uses snapshot prices
- **WHEN** order has 2 items: product A (qty 2, price snapshot 500.00) and product B (qty 1, price snapshot 300.00)
- **THEN** Pedido.total = 1300.00

### Requirement: Address snapshot is stored as flat fields in Pedido
The system SHALL copy delivery address fields (`calle`, `numero`, `piso`, `ciudad`, `codigo_postal`) directly into the `Pedido` record at creation. Subsequent address changes SHALL NOT affect the stored order address.

#### Scenario: Address snapshot captured at creation time
- **WHEN** order is created referencing address with street "Av. Siempre Viva 742"
- **THEN** Pedido.direccion_calle = "Av. Siempre Viva 742" regardless of subsequent address updates

#### Scenario: Non-existent address returns error
- **WHEN** client sends a direccionId that does not exist or belongs to another user
- **THEN** system returns 404 Not Found; no order is created

### Requirement: New order starts in PENDIENTE state
Every new order SHALL be created in state PENDIENTE (ID=1) and an initial record SHALL be appended to `HistorialEstadoPedido` within the same transaction.

#### Scenario: Initial state is PENDIENTE
- **WHEN** order is successfully created
- **THEN** Pedido.estado_id = 1 (PENDIENTE)

#### Scenario: HistorialEstadoPedido has initial record
- **WHEN** order is created
- **THEN** HistorialEstadoPedido has one record with estado_nuevo=PENDIENTE, estado_anterior=NULL, cambiado_por="SISTEMA"

### Requirement: Cart is cleared after successful order creation
The system SHALL respond with the new order data so the frontend can clear the cart upon receiving a 201 response.

#### Scenario: Frontend clears cart on success
- **WHEN** POST /api/v1/pedidos returns 201
- **THEN** frontend calls cartStore.clearCart() and navigates to /orders/:id

### Requirement: Ingredient exclusions stored per order item
The system SHALL store ingredient exclusion IDs as an integer array in `DetallePedido.exclusiones`. An empty array is valid (no exclusions).

#### Scenario: Exclusions saved correctly
- **WHEN** item is added with exclusions [2, 5]
- **THEN** DetallePedido.exclusiones = [2, 5]

#### Scenario: Item with no exclusions stores empty array
- **WHEN** item is added with no exclusions
- **THEN** DetallePedido.exclusiones = []

### Requirement: Client can retrieve their order history
The system SHALL provide `GET /api/v1/pedidos` returning all orders belonging to the authenticated client, ordered by creation date descending.

#### Scenario: Client sees own orders only
- **WHEN** client requests GET /api/v1/pedidos
- **THEN** system returns only orders with usuario_id matching the JWT token

#### Scenario: Empty history returns empty list
- **WHEN** client has no orders
- **THEN** system returns 200 with empty array

### Requirement: Client can retrieve a single order by ID
The system SHALL provide `GET /api/v1/pedidos/{id}` returning full order detail including items, estado, and address snapshot. Client may only access their own orders.

#### Scenario: Own order returned with full detail
- **WHEN** client requests GET /api/v1/pedidos/1 (their own order)
- **THEN** system returns order with items, estado name, total, and address snapshot fields

#### Scenario: Another user's order returns 403
- **WHEN** client requests an order belonging to a different user
- **THEN** system returns 403 Forbidden

### Requirement: Rate limiting on order creation
The system SHALL enforce a maximum of 10 order creation requests per user per hour.

#### Scenario: Exceeding rate limit returns 429
- **WHEN** a user submits more than 10 POST /api/v1/pedidos within one hour
- **THEN** system returns 429 Too Many Requests
