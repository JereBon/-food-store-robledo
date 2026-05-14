## 1. Git Setup

- [ ] 1.1 Crear rama `us-007-pagos-mp` desde `main`

## 2. Entorno y Dependencias

- [x] 2.1 Agregar `mercadopago` a `backend/requirements.txt`
- [ ] 2.2 Agregar variables `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_PUBLIC_KEY` a `.env.example` y `.env` local (con valores TEST-)
- [ ] 2.3 Agregar `VITE_MERCADOPAGO_PUBLIC_KEY` a `.env.example` del frontend (si aplica)

## 3. Database Migration

- [x] 3.1 Crear migración `backend/alembic/versions/0007_pagos.py` con:
  - Tabla `forma_pago` (id, nombre, activo, created_at)
  - Tabla `pago` (id, pedido_id FK, monto, mp_payment_id, mp_status, external_reference, idempotency_key UNIQUE, created_at)
  - Columna `forma_pago_id` (INT FK nullable→luego NOT NULL) en tabla `pedido`
- [x] 3.2 Agregar seed en `upgrade()`: 2 registros en `forma_pago` (Tarjeta de crédito id=1, Tarjeta de débito id=2, activo=true)
- [x] 3.3 Implementar `downgrade()` con reverso de las 3 operaciones en orden
- [ ] 3.4 Ejecutar `alembic upgrade head` y verificar que no hay errores

## 4. Backend: Modelos y Schemas de Pagos

- [x] 4.1 Implementar `FormaPago` SQLModel en `backend/app/modules/pagos/model.py` (id, nombre, activo, created_at)
- [x] 4.2 Implementar `Pago` SQLModel en el mismo archivo (id, pedido_id, monto, mp_payment_id, mp_status, external_reference, idempotency_key, created_at)
- [x] 4.3 Implementar schemas en `backend/app/modules/pagos/schemas.py`: `FormaPagoResponse`, `CrearPreferenciaRequest` (pedido_id), `CrearPreferenciaResponse` (preference_id, init_point), `PagoResponse`, `WebhookPayload` (type, data.id)

## 5. Backend: Corregir PedidoService y Schema

- [x] 5.1 Agregar `forma_pago_id: int` a `PedidoCreate` en `backend/app/modules/pedidos/schemas.py`
- [x] 5.2 Agregar `forma_pago_id` al modelo `Pedido` en `backend/app/modules/pedidos/model.py` (FK a forma_pago)
- [x] 5.3 Remover el bloque de decremento de stock al final de `PedidoService.create_order` en `service.py`
- [x] 5.4 Agregar validación de `forma_pago_id` en `PedidoService.create_order`: verificar que existe y está activa; lanzar ValueError si no
- [x] 5.5 Actualizar tests existentes de pedidos que fallarán por el nuevo campo `forma_pago_id` requerido

## 6. Backend: PagoRepository

- [x] 6.1 Implementar `PagoRepository` en `backend/app/modules/pagos/repository.py`:
  - `create(pago: Pago) -> Pago`
  - `get_by_idempotency_key(key: str) -> Pago | None`
  - `list_by_pedido(pedido_id: int) -> list[Pago]`
- [x] 6.2 Implementar `FormaPagoRepository` en el mismo archivo:
  - `list_active() -> list[FormaPago]`
  - `get_by_id(id: int) -> FormaPago | None`

## 7. Backend: PagoService

- [x] 7.1 Implementar `PagoService.crear_preferencia(uow, pedido_id, usuario_id) -> CrearPreferenciaResponse`:
  - Verificar que el pedido existe, es del usuario y está en PENDIENTE
  - Construir items de preferencia con precios snapshot de DetallePedido
  - Llamar SDK MP: `sdk.preference().create({items, back_urls, external_reference, notification_url})`
  - Retornar preference_id e init_point
- [x] 7.2 Implementar `PagoService.process_webhook(uow, payload: WebhookPayload)`:
  - Extraer payment_id del payload
  - Consultar `sdk.payment().get(payment_id)` para obtener estado real (RN-PA04)
  - Calcular `idempotency_key = f"{external_reference}-{payment_id}"`
  - Verificar idempotencia: si ya existe, retornar sin procesar
  - Crear registro `Pago` con mp_status
  - Si mp_status == "approved": decrementar stock de cada DetallePedido + cambiar estado del pedido a CONFIRMADO + registrar en HistorialEstadoPedido

## 8. Backend: Router de Pagos

- [x] 8.1 Implementar router en `backend/app/modules/pagos/router.py`:
  - `GET /api/v1/pagos/formas-pago` — público, retorna lista de FormaPago activas
  - `POST /api/v1/pagos/crear-preferencia` — autenticado, recibe `CrearPreferenciaRequest`
  - `POST /api/v1/pagos/webhook` — público (no auth), recibe notificación IPN, siempre responde 200
  - `GET /api/v1/pagos/pedido/{pedido_id}` — autenticado, retorna historial de pagos del pedido

## 9. Backend: UoW y Router Principal

- [x] 9.1 Agregar `self.pagos: PagoRepository` y `self.formas_pago: FormaPagoRepository` en `backend/app/uow.py`
- [x] 9.2 Registrar `pagos.router` en `backend/app/modules/router.py`

## 10. Backend: Tests

- [x] 10.1 Tests de `PagoService` (`backend/tests/modules/pagos/test_service.py`):
  - `crear_preferencia` exitosa con pedido PENDIENTE
  - `crear_preferencia` falla si pedido no está PENDIENTE o no es del usuario
  - `process_webhook` approved → Pago creado + PENDIENTE→CONFIRMADO + stock decrementado
  - `process_webhook` rejected → Pago creado con "rejected" + pedido sigue PENDIENTE
  - `process_webhook` duplicado → idempotencia, no se crea segundo Pago
- [x] 10.2 Tests del router de pagos (`backend/tests/modules/pagos/test_router.py`):
  - `GET /formas-pago` retorna formas activas
  - `POST /crear-preferencia` 200 con pedido PENDIENTE propio; 404 con pedido ajeno
  - `POST /webhook` siempre 200; approved cambia estado; rejected no cambia
  - `GET /pedido/{id}` 200 propio; 403 ajeno

## 11. Frontend: paymentStore

- [x] 11.1 Implementar `frontend/src/shared/stores/paymentStore.ts` con estado completo:
  - State: `status`, `preferenceId`, `initPoint`, `error`, `isLoading`
  - Acciones: `startCheckout(pedidoId)` (llama `POST /pagos/crear-preferencia`, setea preferenceId e initPoint), `updatePaymentStatus(status)`, `resetPayment()`
  - Sin persist (estado transitorio)

## 12. Frontend: Checkout con Forma de Pago

- [x] 12.1 Agregar selector de `FormaPago` al componente de checkout (`frontend/src/features/checkout/` o `frontend/src/pages/checkout/index.tsx`):
  - Fetch `GET /api/v1/pagos/formas-pago` al montar
  - Renderizar como radio buttons o select
  - Deshabilitar "Confirmar pedido" si no se ha seleccionado forma de pago
- [x] 12.2 Actualizar `placeOrder` en `orderStore` (o directamente en CheckoutPage) para incluir `forma_pago_id` en el payload de `POST /api/v1/pedidos`
- [x] 12.3 Tras `placeOrder` exitoso: llamar `paymentStore.startCheckout(newOrder.id)` y redirigir con `window.location.href = initPoint` (no `navigate`, es URL externa)

## 13. Frontend: Páginas de Retorno

- [x] 13.1 Crear `frontend/src/pages/pago/ExitoPage.tsx` — muestra "¡Pago aprobado!" con link a `/orders`
- [x] 13.2 Crear `frontend/src/pages/pago/PendientePage.tsx` — muestra "Pago en proceso" con explicación y link a `/orders`
- [x] 13.3 Crear `frontend/src/pages/pago/FalloPage.tsx` — muestra "Pago rechazado" con opción de reintentar o ir a `/orders`

## 14. Frontend: Routing

- [x] 14.1 Registrar rutas `/pago/exito`, `/pago/pendiente`, `/pago/fallo` en `frontend/src/app/router/` (sin protección de auth — MercadoPago redirige sin token)

## 15. Frontend: Tests

- [x] 15.1 Tests de `paymentStore` (`frontend/src/shared/stores/__tests__/paymentStore.test.ts`):
  - `startCheckout` exitoso setea preferenceId e initPoint
  - `startCheckout` con error setea error
  - `resetPayment` limpia estado
- [x] 15.2 Tests del CheckoutPage con forma de pago (`frontend/src/pages/checkout/__tests__/`):
  - Selector de forma de pago renderiza opciones del API
  - Botón deshabilitado sin forma de pago seleccionada
  - Confirmación incluye forma_pago_id en el payload
  - Tras placeOrder exitoso llama startCheckout y redirige a initPoint
- [x] 15.3 Tests de páginas de retorno: render correcto de ExitoPage, PendientePage, FalloPage con link a /orders
