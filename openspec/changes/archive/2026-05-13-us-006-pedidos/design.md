## Context

El proyecto tiene backend Feature-First (FastAPI + SQLModel + UnitOfWork) y frontend Feature-Sliced Design (React + Zustand + TanStack Query). El carrito es client-side puro (localStorage). Los módulos `pedidos`, `pagos` y `direcciones` ya existen en la carpeta de módulos pero son placeholders (`# placeholder` en todos los archivos).

El UoW actual solo registra `users` y `refresh_tokens`. Las migraciones llegan hasta `0005_productos_ingredientes_m2m`. Los pedidos tienen dependencias de negocio críticas: stock se valida dentro de la transacción (SELECT FOR UPDATE) y se generan snapshots de precio y dirección para inmutabilidad.

## Goals / Non-Goals

**Goals:**
- Implementar `DireccionEntrega` completo (CRUD con ownership por usuario, predeterminada automática)
- Implementar `Pedido` con creación atómica via UoW: INSERT en `Pedido` + `DetallePedido[]` + `HistorialEstadoPedido` en una sola transacción
- Validar stock con SELECT FOR UPDATE antes de cualquier INSERT
- Generar snapshot de precio (`precio_unitario` en `DetallePedido`) y snapshot de dirección (campos copiados en `Pedido`)
- FSM inicial: estado PENDIENTE al crear; registro en `HistorialEstadoPedido`
- Frontend: `orderStore`, página de checkout, confirmación y historial de órdenes
- Ruta `/checkout` protegida (requiere auth + role CLIENT)

**Non-Goals:**
- Integración real con MercadoPago (es US-007)
- FSM completo (CONFIRMADO → EN_PREPARACION → etc.) — depende del webhook de pago (US-007)
- Módulo `pagos` — es US-007
- Cancelación de pedidos (US-043)
- Panel de gestión de pedidos para GESTOR/ADMIN — es US-008

## Decisions

### D1: Snapshot de dirección como campos planos en `Pedido`

**Decisión**: Copiar los campos de dirección directamente en la tabla `Pedido` (`direccion_calle`, `direccion_numero`, `direccion_piso`, `direccion_ciudad`, `direccion_cp`), no como FK ni JSON.

**Razón**: Inmutabilidad garantizada por diseño (RN-PE03, RN-DA06). Una FK rompería el snapshot si la dirección se edita o elimina. JSON sería menos eficiente para consultas. Los campos planos son simples y alineados con la regla de negocio.

**Alternativa descartada**: FK a `DireccionEntrega` con soft-delete. Descartada porque un UPDATE en la dirección afectaría el snapshot.

### D2: Validación de stock dentro de la transacción con `text()` + `FOR UPDATE`

**Decisión**: En el servicio de pedidos, dentro del UoW, ejecutar `SELECT stock FROM producto WHERE id = X FOR UPDATE` para cada ítem antes de cualquier INSERT. Validar TODOS los ítems primero; si alguno falla, lanzar excepción y rollback automático.

**Razón**: RN-PE04, RN-PE05. Un race condition entre dos requests concurrentes podría crear pedidos con stock insuficiente si no se bloquea la fila.

**Alternativa descartada**: Validar stock a nivel de repositorio con un simple `SELECT` sin FOR UPDATE. Descartada por race conditions bajo carga.

### D3: UoW extendido con `direcciones` y `pedidos`

**Decisión**: Agregar `self.direcciones: DireccionRepository` y `self.pedidos: PedidoRepository` al UoW existente en `uow.py`, siguiendo el patrón actual.

**Razón**: El UoW maneja la sesión compartida; los repositorios de pedidos necesitan estar en la misma sesión para que la transacción sea atómica. No crear sesiones paralelas.

### D4: `HistorialEstadoPedido` append-only, registrado en la misma transacción

**Decisión**: Al crear el pedido, dentro del mismo bloque `with UoW()`, insertar un registro en `HistorialEstadoPedido` con `estado_nuevo=PENDIENTE`, `estado_anterior=NULL`, `cambiado_por="SISTEMA"`.

**Razón**: RN-FS07, RN-DA05. El historial es parte de la creación atómica; si el historial falla, el pedido no se crea.

### D5: `orderStore` en Zustand sin persistencia

**Decisión**: El `orderStore` de frontend NO persiste en localStorage. Guarda el pedido en curso (`currentOrder`) solo en memoria de sesión.

**Razón**: Los pedidos se consultan desde el backend. Persistir un pedido en curso en localStorage podría causar datos obsoletos. El `cartStore` ya maneja la persistencia hasta el checkout.

### D6: Checkout page como flujo de 2 pasos (sin pago real)

**Decisión**: La página `/checkout` tiene 2 pasos: (1) selección de dirección, (2) confirmación de resumen. Al confirmar, llama `POST /api/pedidos` y navega a `/orders/:id`. El pago se conectará en US-007.

**Razón**: El pago real depende de MercadoPago (US-007). Tener el checkout funcional sin pago permite validar el flujo completo de creación de pedidos ahora.

## Risks / Trade-offs

- **[Risk] SELECT FOR UPDATE en SQLite (tests)** → El test DB probablemente es PostgreSQL en CI, pero si hay tests con SQLite, `FOR UPDATE` no está soportado. **Mitigación**: Asegurar que los tests de pedidos usen PostgreSQL o mockear el repositorio. Usar `try/except` en el repositorio para degradar gracefully en test.
- **[Risk] UoW no importa los nuevos repositorios automáticamente** → Los imports circulares son un riesgo dado el patrón actual. **Mitigación**: Agregar imports al final del archivo con `# noqa: E402` como se hace en otros módulos.
- **[Risk] Cart vacío si el usuario navega directamente a `/checkout`** → Frontend debe redirigir a `/catalog` si el carrito está vacío al entrar a `/checkout`. **Mitigación**: Guard en el componente `CheckoutPage`.
- **[Risk] Precios desincronizados entre carrito y backend** → El snapshot usa el precio del backend al momento del INSERT, no el precio del cartStore. Si cambiaron, el usuario puede sorprenderse. **Mitigación**: US-070 (verificación de precios) es un US futuro; por ahora el backend usa el precio actual del producto.

## Migration Plan

1. Crear migración `0006_pedidos.py` con tablas: `direccion_entrega`, `estado_pedido`, `pedido`, `detalle_pedido`, `historial_estado_pedido`
2. Seed en la migración: 6 registros en `estado_pedido` (PENDIENTE=1, CONFIRMADO=2, EN_PREPARACION=3, EN_CAMINO=4, ENTREGADO=5, CANCELADO=6)
3. Ejecutar `alembic upgrade head`
4. Registrar routers en `backend/app/modules/router.py`
5. Extender `uow.py`

**Rollback**: `alembic downgrade -1` — la migración debe incluir `drop_table` en `downgrade()`.

## Open Questions

- ¿Se incluye `costo_envio` en el total del pedido (RN-PE08) con un valor fijo o siempre 0 en este sprint? → **Propuesta**: `costo_envio=0.00` por defecto en este sprint; US-007 puede ajustarlo con la preferencia de MercadoPago.
- ¿La página `/orders` (historial) se muestra paginada o con scroll infinito? → **Propuesta**: lista simple sin paginación por ahora (primeros 20 pedidos).
