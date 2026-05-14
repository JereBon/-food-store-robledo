## 1. Git Setup

- [x] 1.1 Crear rama `change/006-pedidos` desde `main`

## 2. Database Migration

- [x] 2.1 Crear migración `backend/alembic/versions/0006_pedidos.py` con tablas: `direccion_entrega`, `estado_pedido`, `pedido`, `detalle_pedido`, `historial_estado_pedido`
- [x] 2.2 Agregar seed en `upgrade()`: 6 registros en `estado_pedido` (PENDIENTE=1, CONFIRMADO=2, EN_PREPARACION=3, EN_CAMINO=4, ENTREGADO=5, CANCELADO=6)
- [x] 2.3 Implementar `downgrade()` con drop de las tablas en orden inverso
- [x] 2.4 Ejecutar `alembic upgrade head` y verificar que no hay errores

## 3. Backend: DireccionEntrega Module

- [x] 3.1 Implementar `DireccionEntrega` SQLModel en `backend/app/modules/direcciones/model.py` (campos: id, usuario_id, calle, numero, piso, ciudad, codigo_postal, es_predeterminada, deleted_at)
- [x] 3.2 Implementar schemas Pydantic en `schemas.py`: `DireccionCreate`, `DireccionUpdate`, `DireccionResponse`
- [x] 3.3 Implementar `DireccionRepository` en `repository.py`: `create`, `list_by_user`, `get_by_id_and_user`, `update`, `soft_delete`, `set_default` (unset previous + set new en una transacción)
- [x] 3.4 Implementar `DireccionService` en `service.py`: crear (auto-predeterminada si es la primera), listar, actualizar, eliminar con manejo de default al borrar
- [x] 3.5 Implementar router en `router.py`: `POST /api/v1/direcciones`, `GET /api/v1/direcciones`, `PATCH /api/v1/direcciones/{id}`, `DELETE /api/v1/direcciones/{id}`, `PATCH /api/v1/direcciones/{id}/predeterminada`
- [x] 3.6 Proteger todos los endpoints con `Depends(get_current_user)` (ownership por JWT)

## 4. Backend: Pedido Module

- [x] 4.1 Implementar modelos SQLModel en `backend/app/modules/pedidos/model.py`: `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadoPedido`
- [x] 4.2 Implementar schemas en `schemas.py`: `PedidoCreate` (con `direccion_id` + `items: List[ItemCreate]`), `ItemCreate` (productId, cantidad, exclusiones), `PedidoResponse`, `DetallePedidoResponse`
- [x] 4.3 Implementar `PedidoRepository` en `repository.py`: `create_pedido`, `create_detalle`, `create_historial`, `get_by_id`, `list_by_user`, `get_stock_for_update` (SELECT FOR UPDATE via `text()`)
- [x] 4.4 Implementar `PedidoService` en `service.py`:
  - `create_order(uow, user_id, direccion_id, items)`: valida dirección, valida stock con FOR UPDATE para todos los ítems, lanza excepción si alguno falla, calcula total con precios snapshot, inserta Pedido + DetallePedido[] + HistorialEstadoPedido en UoW
- [x] 4.5 Implementar router en `router.py`: `POST /api/v1/pedidos` (rate limit 10/hora), `GET /api/v1/pedidos`, `GET /api/v1/pedidos/{id}`
- [x] 4.6 Proteger endpoints con `Depends(get_current_user)`; `GET /pedidos/{id}` verifica ownership (403 si no es del usuario)

## 5. Backend: UoW y Router Principal

- [x] 5.1 Extender `backend/app/uow.py`: agregar `self.direcciones: DireccionRepository` y `self.pedidos: PedidoRepository` en `__enter__`
- [x] 5.2 Registrar routers en `backend/app/modules/router.py`: incluir `direcciones.router` y `pedidos.router`

## 6. Backend: Tests

- [x] 6.1 Tests del servicio de pedidos (`backend/tests/modules/pedidos/test_service.py`): creación exitosa, stock insuficiente rechaza, transacción atómica (mock de fallo a mitad)
- [x] 6.2 Tests del router de pedidos (`backend/tests/modules/pedidos/test_router.py`): POST /pedidos (201, 422 sin stock, 404 sin dirección), GET /pedidos, GET /pedidos/:id (200 propio, 403 ajeno)
- [x] 6.3 Tests del router de direcciones (`backend/tests/modules/direcciones/test_router.py`): CRUD completo, auto-predeterminada, set_default, ownership 403

## 7. Frontend: orderStore

- [x] 7.1 Crear `frontend/src/shared/stores/orderStore.ts` con Zustand (sin persist): state `currentOrder`, `myOrders`, `isLoading`, `error`; acciones `placeOrder(payload)`, `fetchMyOrders()`, `fetchOrder(id)`, `reset()`
- [x] 7.2 Agregar tipos `Order`, `OrderItem`, `OrderStatus` en `frontend/src/shared/api/` o feature de orders

## 8. Frontend: Checkout Feature

- [x] 8.1 Crear `frontend/src/features/checkout/` con componentes: `AddressList` (radio buttons de direcciones), `AddressForm` (inline), `CartSummary` (solo lectura), `CheckoutConfirm`
- [x] 8.2 Crear `frontend/src/pages/checkout/index.tsx`: flujo de 2 pasos (selección dirección → confirmación), guard de carrito vacío y auth, llama `orderStore.placeOrder` al confirmar, limpia cart y navega a `/orders/:id`
- [x] 8.3 Conectar botón "Proceder al Checkout" en `frontend/src/pages/cart/index.tsx` a `navigate('/checkout')` (reemplazar placeholder)

## 9. Frontend: Orders Pages

- [x] 9.1 Crear `frontend/src/pages/orders/index.tsx` — historial de pedidos: lista de pedidos del usuario con ID, fecha, badge de estado, nro. de ítems, total; estado vacío con link al catálogo
- [x] 9.2 Crear `frontend/src/pages/orders/[id].tsx` (o `OrderDetailPage`) — detalle de pedido: ID, estado, dirección snapshot, ítems con precios snapshot, total, fecha; 403 si no es propio
- [x] 9.3 Agregar link "Mis Pedidos" en `frontend/src/shared/components/Navigation.tsx` para usuarios autenticados

## 10. Frontend: Routing

- [x] 10.1 Registrar rutas `/checkout`, `/orders`, `/orders/:id` en `frontend/src/app/router/` con protección de auth

## 11. Frontend: Tests

- [x] 11.1 Tests del orderStore: placeOrder éxito, placeOrder error 422, fetchMyOrders, reset
- [x] 11.2 Tests de CheckoutPage: render con items y direcciones, guard carrito vacío, confirmación exitosa navega a /orders/:id, error de stock mostrado inline
- [x] 11.3 Tests de OrdersPage: lista de pedidos, estado vacío
- [x] 11.4 Tests de OrderDetailPage: render de detalle, 403 redirige
