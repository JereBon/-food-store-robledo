## MODIFIED Requirements

### Requirement: Zustand stores exist for core client state
El frontend SHALL proveer cuatro stores Zustand: `authStore`, `cartStore`, `paymentStore` y `uiStore`, con acciones base y persistencia donde corresponda. El `cartStore` SHALL incluir metadatos de producto (name, price, image_url) en cada item y selectores derivados `totalItems()`, `totalPrice()`, `getItem(productId)`.

#### Scenario: Stores are available to features and pages
- **WHEN** una página o feature necesita estado del cliente (sesión, carrito, pago o UI)
- **THEN** puede consumir el store correspondiente sin acoplarse a implementaciones internas de otras features

#### Scenario: Cart store includes product snapshots
- **WHEN** un producto se agrega al carrito
- **THEN** el item almacena name, price e image_url como snapshot al momento de agregar

#### Scenario: Cart store exposes derived selectors
- **WHEN** cualquier componente consulta totalItems(), totalPrice() o getItem()
- **THEN** los selectores devuelven valores calculados correctamente sin re-renders innecesarios
