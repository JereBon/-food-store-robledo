## Why

El carrito de compras (US-005) está completo y el botón "Proceder al Checkout" ya existe, pero navega a ningún lado. Para cerrar el ciclo de compra, el cliente necesita seleccionar una dirección de entrega y confirmar el pedido — generando un registro atómico en la base de datos con snapshot de precios y dirección. Sin esto, el sistema no puede procesar órdenes reales.

## What Changes

- **Backend: módulo `direcciones`** — implementación completa del CRUD de DireccionEntrega (era placeholder): model, schemas, repository, service, router. Primera dirección se marca como predeterminada automáticamente.
- **Backend: módulo `pedidos`** — implementación completa: model (Pedido, DetallePedido, HistorialEstadoPedido), schemas, repository, service con creación atómica via Unit of Work, validación de stock con SELECT FOR UPDATE, snapshot de precio y dirección, FSM inicial (estado PENDIENTE al crear).
- **Database migrations** — migración `0006_pedidos`: tablas `DireccionEntrega`, `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadoPedido`; seed de 6 estados (PENDIENTE→ENTREGADO/CANCELADO).
- **Frontend: `orderStore`** — nuevo Zustand store para estado del checkout: `currentOrder`, `checkoutStep`, acciones `placeOrder`, `fetchMyOrders`, `fetchOrder`.
- **Frontend: Checkout page** (`/checkout`) — selección de dirección, resumen del carrito con precios, confirmación de pedido; vacía el carrito al crear exitosamente.
- **Frontend: Order Confirmation page** (`/orders/:id`) — detalle del pedido recién creado con estado, items, snapshot de dirección y total.
- **Frontend: My Orders page** (`/orders`) — historial de pedidos del cliente con estado y resumen.

## Capabilities

### New Capabilities
- `order-creation`: Creación atómica de pedidos con Unit of Work, validación de stock intra-transaccional, snapshot de precio por ítem y snapshot de dirección de entrega.
- `delivery-addresses`: CRUD de direcciones de entrega del cliente; primera dirección predeterminada automáticamente, solo una predeterminada a la vez.
- `checkout-flow`: Flujo frontend de checkout: orderStore Zustand, página de checkout, confirmación de pedido e historial de órdenes.

### Modified Capabilities
- `shopping-cart`: El botón "Proceder al Checkout" en CartPage ahora navega a `/checkout` (antes era placeholder sin destino).

## Impact

- **Backend**: `backend/app/modules/direcciones/` y `backend/app/modules/pedidos/` — implementación completa de todos los archivos (eran placeholders). `backend/alembic/versions/0006_pedidos.py` — nueva migración. `backend/app/modules/router.py` — registrar routers de direcciones y pedidos. `backend/app/uow.py` — agregar repositorios `direcciones` y `pedidos`.
- **Frontend**: `frontend/src/shared/stores/orderStore.ts` — nuevo store. `frontend/src/features/checkout/` — nueva feature. `frontend/src/pages/checkout/`, `frontend/src/pages/orders/` — nuevas páginas. `frontend/src/pages/cart/index.tsx` — conectar botón "Proceder al Checkout" a `/checkout`. `frontend/src/app/router/` — registrar nuevas rutas.
- **Dependencias nuevas**: ninguna (mercadopago SDK se agrega en US-007).
