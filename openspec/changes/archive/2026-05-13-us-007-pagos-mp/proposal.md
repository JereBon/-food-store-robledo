## Why

El ciclo de compra de US-006 crea pedidos en estado PENDIENTE pero no tiene integración de pagos: el stock se descuenta al crear el pedido (incorrecto según el modelo de dominio) y no hay forma de que el cliente pague. Para cerrar el flujo de pago, necesitamos integrar MercadoPago Checkout Pro: el cliente paga en el entorno seguro de MP, el webhook IPN actualiza el estado del pedido automáticamente y en ese momento se descuenta el stock (RN-FS02, RN-PA05).

## What Changes

- **Backend: módulo `pagos`** — implementación completa del placeholder: modelo `Pago` (mp_payment_id, mp_status, external_reference, idempotency_key), `FormaPago` catalog, repositorio, servicio con SDK Python de MercadoPago, router con 3 endpoints.
- **Backend: endpoint `crear-preferencia`** — recibe `pedido_id`, crea preferencia en MP con ítems snapshot, external_reference y URLs de retorno, devuelve `init_point` para redirigir al cliente.
- **Backend: endpoint `webhook`** — recibe IPN de MercadoPago, verifica estado real consultando la API de MP, aplica idempotencia por `idempotency_key`, actualiza `Pago` y dispara FSM PENDIENTE→CONFIRMADO si `mp_status = "approved"`.
- **Backend: FSM PENDIENTE→CONFIRMADO** — la transición automática se hace desde el servicio de pagos al recibir webhook approved; descuenta stock dentro de la misma transacción (UoW).
- **Backend: corregir descuento de stock** — remover el decremento de stock de `PedidoService.create_order` (actualmente incorrecto per RN-FS02); el stock se descuenta solo en PENDIENTE→CONFIRMADO.
- **Backend: migración 0007** — tablas `forma_pago` (catálogo) y `pago`; seed de 2 formas de pago (Tarjeta de crédito, Tarjeta de débito).
- **Backend: actualizar `PedidoCreate`** — agregar `forma_pago_id` al schema y al modelo `Pedido`.
- **Frontend: `paymentStore`** — implementación completa del stub actual: `startCheckout(pedidoId)`, `setPreference(preferenceId, initPoint)`, `updatePaymentStatus(status)`, `resetPayment()`; sin persist (estado transitorio).
- **Frontend: página de pago** — llama `crear-preferencia` con el `pedido_id` recién creado, redirige al `init_point` de MercadoPago.
- **Frontend: URLs de retorno** — páginas `/pago/exito`, `/pago/pendiente`, `/pago/fallo` que reciben el resultado del pago y actualizan el estado del pedido.
- **Frontend: selección de forma de pago** — en el checkout (antes de confirmar), agregar selector de `FormaPago` activas.

## Capabilities

### New Capabilities
- `payment-processing`: Integración MercadoPago Checkout Pro — creación de preferencia con ítems snapshot, webhook IPN idempotente, FSM PENDIENTE→CONFIRMADO automática, decremento de stock en aprobación.
- `payment-methods`: Catálogo de formas de pago (`forma_pago` table, seed: Tarjeta de crédito / Tarjeta de débito); `GET /api/v1/pagos/formas-pago` para el frontend.

### Modified Capabilities
- `order-creation`: (1) Agregar `forma_pago_id` al modelo Pedido y schema PedidoCreate. (2) Eliminar el decremento de stock de `create_order` — el stock solo se descuenta en PENDIENTE→CONFIRMADO per RN-FS02.
- `checkout-flow`: Agregar paso de selección de forma de pago en el checkout y redirigir al `init_point` de MercadoPago tras crear el pedido; manejar URLs de retorno.
- `product-stock`: Stock decrementado en PENDIENTE→CONFIRMADO (pago aprobado), no en creación de pedido. Comportamiento actual es incorrecto y debe corregirse.

## Impact

- **Backend**: `backend/app/modules/pagos/` — implementación completa (model, schemas, repository, service, router). `backend/alembic/versions/0007_pagos.py` — nueva migración. `backend/app/modules/pedidos/model.py`, `schemas.py`, `service.py` — agregar forma_pago_id y remover decremento de stock. `backend/app/uow.py` — agregar `self.pagos: PagoRepository`. `backend/app/modules/router.py` — registrar router de pagos. Variables de entorno: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`.
- **Frontend**: `frontend/src/shared/stores/paymentStore.ts` — implementación completa. `frontend/src/features/checkout/` — agregar selector de forma de pago. `frontend/src/pages/pago/` — páginas de retorno (éxito, pendiente, fallo). `frontend/src/app/router/` — rutas `/pago/exito`, `/pago/pendiente`, `/pago/fallo`. Variable de entorno: `VITE_MERCADOPAGO_PUBLIC_KEY`.
- **Dependencias nuevas**: `mercadopago` (Python SDK), `@mercadopago/sdk-js` (ya listado en Historias_de_usuario.txt).
- **Tests**: Backend — tests de PagoService (crear preferencia, webhook approved/rejected/pending, idempotencia), tests de router de pagos. Frontend — tests de paymentStore, tests de checkout con forma de pago, tests de páginas de retorno.
