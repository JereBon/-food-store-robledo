## MODIFIED Requirements

### Requirement: Checkout page shows cart summary, address selection, and payment method selection
The system SHALL display on `/checkout`: (1) read-only cart summary with item names, quantities, exclusions, subtotals, and total; (2) a list of the user's saved addresses with radio buttons; (3) a "Agregar nueva dirección" inline form; (4) a dropdown or radio group of active FormaPago options; (5) a "Confirmar pedido" button disabled until both an address and a payment method are selected.

#### Scenario: Cart items displayed correctly
- **WHEN** user arrives at /checkout with 2 cart items
- **THEN** page shows both items with name, quantity, unit price, and subtotal

#### Scenario: Saved addresses listed for selection
- **WHEN** user has 2 saved addresses
- **THEN** both are listed as radio options; default address is pre-selected

#### Scenario: Payment methods listed for selection
- **WHEN** user arrives at /checkout
- **THEN** active FormaPago options (from GET /api/v1/pagos/formas-pago) are shown as radio buttons or dropdown

#### Scenario: Confirm button disabled without address or payment method
- **WHEN** no address or no payment method is selected
- **THEN** "Confirmar pedido" button is disabled

### Requirement: Checkout confirms order and redirects to MercadoPago
The system SHALL call `POST /api/v1/pedidos` (with `forma_pago_id`) on confirm, clear the cart on success, call `POST /api/v1/pagos/crear-preferencia` with the new order's ID, and redirect the browser to the returned `init_point` URL. On error it SHALL display the error without leaving the page.

#### Scenario: Successful order creation redirects to MercadoPago
- **WHEN** user clicks "Confirmar pedido" with address and payment method selected
- **THEN** system places order, clears cart, calls crear-preferencia, and redirects browser to init_point URL

#### Scenario: Insufficient stock error shown inline
- **WHEN** API returns 422 with stock error
- **THEN** page shows which product has insufficient stock; user remains on /checkout

#### Scenario: Network error shows toast
- **WHEN** API call fails with a network error
- **THEN** page shows a generic error toast; order is not placed

## ADDED Requirements

### Requirement: paymentStore manages the payment process state
The system SHALL provide a fully implemented Zustand store (`paymentStore`) with NO localStorage persistence. The store SHALL manage `status` (idle | pending | approved | rejected), `preferenceId`, `initPoint`, and `error` with actions `startCheckout(pedidoId)` (calls crear-preferencia and sets initPoint), `updatePaymentStatus(status)`, and `resetPayment()`.

#### Scenario: startCheckout sets preference and initPoint
- **WHEN** startCheckout(pedidoId) is called and API returns preference
- **THEN** paymentStore.preferenceId and initPoint are set; status becomes "pending"

#### Scenario: startCheckout failure sets error
- **WHEN** crear-preferencia API returns an error
- **THEN** paymentStore.error contains the message; status stays "idle"

#### Scenario: Store is not persisted to localStorage
- **WHEN** user refreshes the page
- **THEN** paymentStore resets to initial state

### Requirement: Payment return pages handle MercadoPago callback
The system SHALL provide three pages that MercadoPago redirects to after payment: `/pago/exito` (approved), `/pago/pendiente` (pending/in_process), and `/pago/fallo` (rejected/cancelled). Each page SHALL display an appropriate message and a link to `/orders`.

#### Scenario: Success page shown for approved payment
- **WHEN** MercadoPago redirects to /pago/exito
- **THEN** page shows "¡Pago aprobado!" message and a link to "Ver mis pedidos"

#### Scenario: Pending page shown for pending payment
- **WHEN** MercadoPago redirects to /pago/pendiente
- **THEN** page shows "Pago en proceso" message explaining payment is being reviewed

#### Scenario: Failure page shown for rejected payment
- **WHEN** MercadoPago redirects to /pago/fallo
- **THEN** page shows "Pago rechazado" message with option to retry or go back to orders
