## Context

US-006 dejó el ciclo de compra incompleto: los pedidos se crean en PENDIENTE y el stock se descuenta en ese mismo momento (incorrecto per RN-FS02). El módulo `pagos` es un placeholder y `paymentStore.ts` es un stub. Esta change integra MercadoPago Checkout Pro, corrige la FSM del pedido y completa el flujo de pago end-to-end.

Estado actual:
- `backend/app/modules/pagos/` — 5 archivos placeholder (model, schemas, repository, service, router)
- `frontend/src/shared/stores/paymentStore.ts` — stub de 10 líneas
- `PedidoService.create_order` — decrementa stock en creación (debe removerse)
- `PedidoCreate` — falta `forma_pago_id`

## Goals / Non-Goals

**Goals:**
- Implementar MercadoPago Checkout Pro (redirect): preferencia, redirect a MP, retorno con resultado
- Implementar webhook IPN idempotente que actualiza `Pago` y dispara FSM PENDIENTE→CONFIRMADO
- Corregir FSM: stock se descuenta únicamente en PENDIENTE→CONFIRMADO (pago aprobado)
- Agregar `FormaPago` catálogo y `forma_pago_id` al pedido
- Completar `paymentStore` y agregar páginas de retorno (`/pago/exito`, `/pago/pendiente`, `/pago/fallo`)

**Non-Goals:**
- Checkout Bricks / tokenización inline (usamos Checkout Pro por simplicidad y PCI SAQ-A)
- Refunds, chargebacks o devoluciones
- WebSocket o polling para estado de pago en tiempo real
- Panel de administración de pagos (eso es US-008)
- Múltiples métodos de pago simultáneos por pedido

## Decisions

### D1: MercadoPago Checkout Pro (redirect) en lugar de Checkout Bricks
Checkout Pro redirige al cliente al entorno de MercadoPago para completar el pago. Los datos de tarjeta nunca tocan nuestro servidor — PCI DSS SAQ-A por defecto. Checkout Bricks sería más embebido pero requiere integración más compleja del SDK JS y mayor esfuerzo de tests. El flujo de redirect es el estándar en proyectos académicos y de producción inicial.

### D2: Verificar siempre el estado consultando la API de MP (RN-PA04)
El webhook IPN solo entrega el tipo de evento y el ID del pago. El servicio SIEMPRE consulta `GET /v1/payments/{payment_id}` de la API de MP para obtener el estado real. Nunca se confía en los datos del webhook directamente.

### D3: idempotency_key = `f"{pedido_id}-{mp_payment_id}"`
Un pedido puede tener múltiples intentos de pago (RN-PA08). La clave `{pedido_id}-{mp_payment_id}` es única por intento de pago. Si el webhook llega duplicado con la misma clave, se ignora silenciosamente (RN-PA02).

### D4: external_reference = str(pedido.id)
El campo `external_reference` enviado a MercadoPago al crear la preferencia es el UUID/ID del pedido en formato string. Esto permite al webhook encontrar el pedido correspondiente sin tabla adicional de mapping.

### D5: FSM en PagoService, no en PedidoService
La transición PENDIENTE→CONFIRMADO la ejecuta `PagoService.process_webhook` dentro de la misma transacción UoW donde registra el pago. Esto garantiza atomicidad: si el decremento de stock falla, el pago tampoco se registra como aprobado.

### D6: UoW ampliado con PagoRepository
Se agrega `self.pagos: PagoRepository` al UoW existente. El webhook usa `uow.pagos.create(pago)` y `uow.pedidos.get_by_id(pedido_id)` en la misma sesión.

### D7: Remover stock decrement de PedidoService.create_order
El código actual en `service.py` que decrementa stock al crear el pedido viola RN-FS02. Se elimina ese bloque. El stock solo cambia en `PagoService.process_webhook` cuando `mp_status == "approved"`.

### D8: Forma de pago seleccionada en checkout, no en creación de preferencia
El cliente elige la forma de pago (tarjeta crédito / débito) en la página de checkout antes de confirmar el pedido. Esta elección se guarda en `Pedido.forma_pago_id`. Luego se crea la preferencia en MP con esa info.

## Risks / Trade-offs

- **[Riesgo] Webhook no llega** (usuario cierra browser post-pago) → El pedido queda en PENDIENTE indefinidamente. Mitigación: el frontend puede hacer polling del estado en `/orders/:id` en la página de retorno y el admin puede manejar casos edge en US-008.
- **[Riesgo] MP no puede contactar webhook en desarrollo** → Usar ngrok o similar para exponer el endpoint local. Documentar en README. En tests se mockea el SDK.
- **[Trade-off] Sin polling durante checkout** → El cliente es redirigido a MP y regresa a las URLs de retorno. No hay UX de "esperando respuesta" en nuestra app durante el pago — esto es intencional (Checkout Pro maneja esa UX).
- **[Riesgo] Token TEST- vs APP_USR-** → El entorno de desarrollo usa token TEST-. Se debe validar que `.env` no use tokens de producción accidentalmente. Mitigación: `.env.example` documenta el prefijo esperado.

## Migration Plan

1. Agregar `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_PUBLIC_KEY` a `.env` y `.env.example`.
2. `pip install mercadopago` → actualizar `requirements.txt`.
3. Crear y ejecutar migración `0007_pagos`: tabla `forma_pago` + tabla `pago` + columna `forma_pago_id` en `pedido`.
4. Ejecutar seed de `forma_pago` (2 registros).
5. Remover bloque de decremento de stock en `PedidoService.create_order`.
6. Implementar módulo `pagos` completo.
7. Actualizar `PedidoCreate` con `forma_pago_id` (breaking change en schema — los tests existentes de pedidos deben actualizarse).
8. Rollback: la migración 0007 tiene `downgrade()` que revierte las 3 operaciones; el bloque de stock en `create_order` puede restaurarse desde git si es necesario.

## Open Questions

- ¿El costo de envío (`costo_envio`) es fijo ($0) o calculado? → Mantener $0.00 (como en US-006) hasta que se especifique.
- ¿El webhook IPN de MP es el legacy (`/ipn`) o el nuevo Notifications API? → Usar el endpoint `/webhook` (tipo `payment`) que es el estándar actual de la API de MP.
