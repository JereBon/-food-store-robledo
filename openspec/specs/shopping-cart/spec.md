# shopping-cart Specification

## Purpose
Carrito de compras client-side con Zustand store, CartDrawer, página de resumen, botones de agregado y badge de navegación.

## Requirements

### Requirement: Cart store manages client-side shopping cart
The system SHALL provide a Zustand store (`cartStore`) with `persist` middleware for client-side cart management. The store SHALL persist to localStorage and survive browser close, refresh, and logout/login.

#### Scenario: Cart persists after page refresh
- **WHEN** user adds items to cart and refreshes the page
- **THEN** cart items are restored from localStorage

#### Scenario: Cart survives logout and login
- **WHEN** user logs out and logs back in
- **THEN** cart items remain intact

#### Scenario: Cart persists after browser close
- **WHEN** user closes browser and reopens the app
- **THEN** cart items are restored from localStorage

### Requirement: CartItem stores product metadata
Each cart item SHALL store `productId`, `name`, `price`, `image_url`, `quantity`, and `exclusions` (array of ingredient IDs).

#### Scenario: Cart item includes product snapshot
- **WHEN** user adds product to cart
- **THEN** item includes name, price, and image_url at the moment of adding

### Requirement: Add item to cart with quantity and exclusions
The system SHALL allow adding a product to the cart with a specified quantity and optional ingredient exclusions.

#### Scenario: Add new product to cart
- **WHEN** user adds a product with quantity 2 and no exclusions
- **THEN** a new cart item appears with quantity 2 and empty exclusions

#### Scenario: Add existing product increments quantity
- **WHEN** user adds a product already in the cart
- **THEN** quantity increments by the specified amount (RN-CR03)

#### Scenario: Add product with ingredient exclusions
- **WHEN** user adds a product with exclusions `[1, 3]`
- **THEN** item stores exclusions array

#### Scenario: Quantity must be >= 1
- **WHEN** user attempts to add product with quantity 0
- **THEN** system ignores or rejects the operation

### Requirement: Update item quantity
The system SHALL allow updating the quantity of any cart item. Setting quantity to 0 SHALL remove the item.

#### Scenario: Increase quantity
- **WHEN** user increases quantity of an item
- **THEN** cart updates quantity and recalculates total

#### Scenario: Decrease quantity to 0 removes item
- **WHEN** user decreases quantity to 0
- **THEN** item is removed from cart

### Requirement: Remove item from cart
The system SHALL allow removing individual items from the cart.

#### Scenario: Remove single item
- **WHEN** user clicks remove on a cart item
- **THEN** item is removed and total recalculated

### Requirement: Clear entire cart
The system SHALL allow clearing all items from the cart with a confirmation dialog.

#### Scenario: Clear cart with confirmation
- **WHEN** user clicks "Clear Cart"
- **THEN** system shows confirmation modal before clearing all items

### Requirement: Cart exposes derived selectors
The cart store SHALL expose computed selectors: `totalItems()` (sum of quantities), `totalPrice()` (sum of price x quantity per item), and `getItem(productId)`.

#### Scenario: Total items reflected in badge
- **WHEN** user has 3 items with quantities 2, 1, 4
- **THEN** totalItems() returns 7

#### Scenario: Total price computed correctly
- **WHEN** user has item A (price 10, qty 2) and item B (price 5, qty 3)
- **THEN** totalPrice() returns 35.00

### Requirement: CartDrawer sidebar shows compact cart view
The system SHALL provide a sliding sidebar drawer accessible from any page showing cart summary with item list, quantities, and total. It SHALL allow adjusting quantities and removing items.

#### Scenario: Drawer opens from navigation
- **WHEN** user clicks cart icon/badge in navigation
- **THEN** drawer slides in from the right with cart contents

#### Scenario: Drawer shows item details
- **WHEN** drawer is open with items
- **THEN** each item shows name, price, quantity, subtotal, and exclusions

#### Scenario: User can adjust quantity in drawer
- **WHEN** user clicks +/- in drawer item
- **THEN** quantity updates and subtotal recalculates

#### Scenario: Empty cart shows message
- **WHEN** cart is empty and drawer opens
- **THEN** drawer shows "Cart is empty" with link to catalog

### Requirement: Cart page shows full cart summary
The system SHALL provide a `/cart` page with complete cart overview including per-item subtotals, total, ingredient exclusions, and a checkout button.

#### Scenario: Cart page displays all items
- **WHEN** user navigates to `/cart`
- **THEN** page shows all items with full details and totals

#### Scenario: Checkout button navigates to next step
- **WHEN** user clicks "Proceed to Checkout" on cart page
- **THEN** system navigates to checkout flow

#### Scenario: Empty cart page shows empty state
- **WHEN** user navigates to `/cart` with empty cart
- **THEN** page shows "Your cart is empty" with link to catalog

### Requirement: Add to Cart button on product views
The system SHALL provide an "Add to Cart" button on catalog product cards and product detail page.

#### Scenario: Add from catalog card
- **WHEN** user clicks "Add to Cart" on a product card in catalog
- **THEN** product is added with quantity 1, no exclusions

#### Scenario: Add from product detail with exclusions
- **WHEN** user is on product detail page and clicks "Add to Cart"
- **THEN** a modal shows ingredient checkboxes; user selects exclusions and quantity, then confirms

### Requirement: Navigation shows cart item count badge
The system SHALL display a badge with total item count next to the cart icon in the navigation bar.

#### Scenario: Badge reflects current count
- **WHEN** user adds/removes items
- **THEN** badge updates reactively
