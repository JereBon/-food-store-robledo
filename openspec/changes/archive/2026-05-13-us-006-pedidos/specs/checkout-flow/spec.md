# checkout-flow Specification

## Purpose
Flujo frontend de checkout: orderStore Zustand, página de checkout con selección de dirección y confirmación, página de detalle de pedido e historial de órdenes del cliente.

## ADDED Requirements

### Requirement: orderStore manages checkout and order state
The system SHALL provide a Zustand store (`orderStore`) with NO localStorage persistence. The store SHALL manage `currentOrder`, `myOrders`, `isLoading`, and `error` state with actions `placeOrder`, `fetchMyOrders`, `fetchOrder`, and `reset`.

#### Scenario: placeOrder success clears store error
- **WHEN** placeOrder resolves successfully
- **THEN** orderStore.error = null and orderStore.currentOrder contains the new order

#### Scenario: placeOrder failure sets error
- **WHEN** the API returns 422 (insufficient stock)
- **THEN** orderStore.error contains the error message and currentOrder remains null

#### Scenario: Store is not persisted to localStorage
- **WHEN** user refreshes the page
- **THEN** orderStore resets to initial state (orders fetched fresh from API)

### Requirement: Checkout page requires authentication and non-empty cart
The system SHALL protect `/checkout` route requiring a valid auth token and a non-empty cart. Unauthenticated users are redirected to `/login`. Users with empty cart are redirected to `/catalogo`.

#### Scenario: Unauthenticated user redirected to login
- **WHEN** unauthenticated user navigates to /checkout
- **THEN** system redirects to /login

#### Scenario: Empty cart redirected to catalog
- **WHEN** authenticated user with empty cart navigates to /checkout
- **THEN** system redirects to /catalogo with a toast message

### Requirement: Checkout page shows cart summary and address selection
The system SHALL display on `/checkout`: (1) read-only cart summary with item names, quantities, exclusions, subtotals, and total; (2) a list of the user's saved addresses with radio buttons; (3) a "Agregar nueva dirección" inline form; (4) a "Confirmar pedido" button.

#### Scenario: Cart items displayed correctly
- **WHEN** user arrives at /checkout with 2 cart items
- **THEN** page shows both items with name, quantity, unit price, and subtotal

#### Scenario: Saved addresses listed for selection
- **WHEN** user has 2 saved addresses
- **THEN** both are listed as radio options; default address is pre-selected

#### Scenario: No addresses shows inline form
- **WHEN** user has no saved addresses
- **THEN** page shows inline address creation form instead of address list

#### Scenario: Confirm button disabled without address selection
- **WHEN** no address is selected
- **THEN** "Confirmar pedido" button is disabled

### Requirement: Checkout confirms order and navigates to confirmation
The system SHALL call `POST /api/v1/pedidos` on confirm, clear the cart on success, and navigate to `/orders/:id`. On error it SHALL display the error without leaving the page.

#### Scenario: Successful order creation
- **WHEN** user clicks "Confirmar pedido" with address selected
- **THEN** system places order, clears cart (cartStore.clearCart()), and navigates to /orders/:id

#### Scenario: Insufficient stock error shown inline
- **WHEN** API returns 422 with stock error
- **THEN** page shows which product has insufficient stock; user remains on /checkout

#### Scenario: Network error shows toast
- **WHEN** API call fails with a network error
- **THEN** page shows a generic error toast; order is not placed

### Requirement: Order confirmation page shows full order detail
The system SHALL display `/orders/:id` with: order ID, status badge, address snapshot, item list with price snapshots, subtotal per item, total, and creation date.

#### Scenario: Order detail renders after creation
- **WHEN** user is redirected to /orders/:id after order creation
- **THEN** page shows all order fields with correct values from the API

#### Scenario: Status displayed as Spanish label
- **WHEN** order is in PENDIENTE state
- **THEN** page shows badge "Pendiente"

#### Scenario: Unauthorized order ID redirects to /orders
- **WHEN** user navigates to /orders/:id for an order they don't own
- **THEN** system shows 403 error and a link back to /orders

### Requirement: My Orders page shows order history
The system SHALL provide `/orders` displaying the authenticated client's orders sorted by date descending. Each row shows order ID, date, status badge, number of items, and total.

#### Scenario: Orders listed newest first
- **WHEN** user has 3 orders
- **THEN** page lists them newest first

#### Scenario: Empty history shows empty state
- **WHEN** user has no orders
- **THEN** page shows "Aún no tienes pedidos" with a link to the catalog

#### Scenario: Each order row links to detail
- **WHEN** user clicks on an order row
- **THEN** system navigates to /orders/:id

### Requirement: Navigation includes My Orders link for authenticated clients
The system SHALL display a "Mis Pedidos" link in the navigation bar for authenticated users, pointing to `/orders`.

#### Scenario: Link visible when logged in
- **WHEN** user is authenticated
- **THEN** navigation shows "Mis Pedidos" link

#### Scenario: Link hidden when logged out
- **WHEN** user is not authenticated
- **THEN** navigation does not show "Mis Pedidos" link
