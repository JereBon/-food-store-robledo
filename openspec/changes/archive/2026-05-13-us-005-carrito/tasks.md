## 1. CartStore — Modelo y Selectores

- [x] 1.1 Actualizar type `CartItem` para incluir `name`, `price`, `image_url`, `quantity` y `exclusions`
- [x] 1.2 Agregar `totalItems()` selector (suma de quantities)
- [x] 1.3 Agregar `totalPrice()` selector (suma de price × quantity)
- [x] 1.4 Agregar `getItem(productId)` selector
- [x] 1.5 Actualizar `addItem` para aceptar `{ productId, name, price, image_url?, quantity?, exclusions? }`
- [x] 1.6 Actualizar persist key name a `food-store-cart` (si no lo está ya)

## 2. Add to Cart Button

- [x] 2.1 Crear componente `AddToCartButton` con quantity selector e indicador de estado
- [x] 2.2 Integrar `AddToCartButton` en `CatalogPage` (agrega rápido, qty=1, sin exclusiones)
- [x] 2.3 Integrar `AddToCartButton` en `ProductDetailPage` (con modal de exclusión de ingredientes)

## 3. Exclusion de Ingredientes

- [x] 3.1 Crear modal `IngredientExclusionModal` con checkboxes de ingredientes del producto
- [x] 3.2 Integrar modal en el flujo de "Add to Cart" desde detalle de producto

## 4. CartDrawer (Sidebar)

- [x] 4.1 Crear componente `CartDrawer` como sidebar deslizable desde la derecha
- [x] 4.2 Integrar listado de items con nombre, precio, cantidad (+/-), subtotal y exclusiones
- [x] 4.3 Agregar controles +/- de cantidad en cada item del drawer
- [x] 4.4 Agregar botón "Remove" por item
- [x] 4.5 Mostrar total del carrito al pie del drawer
- [x] 4.6 Mostrar estado vacío con link al catálogo cuando no hay items
- [x] 4.7 Agregar estado `cartOpen` a uiStore y conectar con el drawer

## 5. CartPage (Ruta /cart)

- [x] 5.1 Crear página `pages/cart/index.tsx` con listado completo de items
- [x] 5.2 Mostrar subtotal por item (price × quantity) y total general
- [x] 5.3 Agregar controles de cantidad y botón de eliminar por item
- [x] 5.4 Agregar botón "Clear Cart" con confirmación modal
- [x] 5.5 Agregar botón "Proceed to Checkout" (placeholder, sin navegación aún)
- [x] 5.6 Mostrar estado vacío con link al catálogo
- [x] 5.7 Registrar ruta `/cart` en AppRouter

## 6. Navigation Badge

- [x] 6.1 Agregar cart icon con badge de `totalItems()` en `Navigation.tsx`
- [x] 6.2 Al hacer clic en el badge, abrir CartDrawer

## 7. Tests

- [x] 7.1 Tests del cartStore: addItem, updateQuantity, removeItem, clearCart, selectores
- [x] 7.2 Tests de CartDrawer: render, open/close, item list, empty state
- [x] 7.3 Tests de CartPage: full summary, quantity controls, clear cart confirmation
