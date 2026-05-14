# shopping-cart Delta Specification

## Purpose
Delta spec: el botón "Proceder al Checkout" en CartPage ahora navega realmente a /checkout en lugar de ser un placeholder sin destino.

## MODIFIED Requirements

### Requirement: Cart page shows full cart summary
The system SHALL provide a `/cart` page with complete cart overview including per-item subtotals, total, ingredient exclusions, and a checkout button that navigates to `/checkout`.

#### Scenario: Cart page displays all items
- **WHEN** user navigates to `/cart`
- **THEN** page shows all items with full details and totals

#### Scenario: Checkout button navigates to checkout page
- **WHEN** user clicks "Proceder al Checkout" on cart page with at least one item
- **THEN** system navigates to `/checkout`

#### Scenario: Checkout button disabled on empty cart
- **WHEN** cart is empty
- **THEN** "Proceder al Checkout" button is disabled or hidden

#### Scenario: Empty cart page shows empty state
- **WHEN** user navigates to `/cart` with empty cart
- **THEN** page shows "Tu carrito está vacío" with link to catalog
