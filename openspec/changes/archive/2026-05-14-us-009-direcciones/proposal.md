## Why

El flujo de checkout (US-006) requiere que el cliente tenga al menos una dirección de entrega registrada para poder confirmar un pedido. Sin un módulo dedicado de gestión de direcciones, no sería posible asociar una ubicación de entrega al pedido ni permitirle al cliente mantener múltiples direcciones reutilizables. Este change formaliza la implementación del EPIC 07 (Sprint 4) — que fue desarrollada junto a US-006 y quedó funcionando pero sin artefacto OpenSpec propio.

## What Changes

- **Backend: módulo `direcciones`** — CRUD completo de `DireccionEntrega`: model SQLModel con soft-delete, schemas Pydantic (Create/Update/Response), repository con queries por usuario, service con lógica de negocio (auto-predeterminada, promoción al eliminar), router REST con 7 endpoints protegidos por JWT.
- **Frontend: componentes de checkout** — `AddressList.tsx` (selector radial con acciones inline + sección de eliminadas recuperables) y `AddressForm.tsx` (formulario crear/editar con validación client-side); integrados en el flujo de checkout.
- **Base de datos** — tabla `direccionentrega` creada en migración `0006_pedidos` junto a las tablas de pedidos.
- **Tests backend** — 8 tests de integración en `backend/tests/modules/direcciones/test_router.py` cubriendo todos los endpoints.

## Capabilities

### New Capabilities
- `delivery-addresses`: CRUD de direcciones de entrega del cliente con soft-delete y recuperación. Primera dirección marcada como predeterminada automáticamente; solo una predeterminada por usuario; si se elimina la predeterminada, se promueve la siguiente activa.

### Modified Capabilities
- `checkout-flow`: AddressList y AddressForm se integran en la página de checkout para selección de dirección al confirmar un pedido.

## Non-goals

- Geolocalización o validación de direcciones contra un mapa/API externa.
- Gestión de zonas de entrega o costos de envío.
- Direcciones para usuarios no-CLIENT (admin, operador, etc.).

## Impact

- **Backend**: `backend/app/modules/direcciones/` (model.py, schemas.py, repository.py, service.py, router.py, __init__.py), `backend/tests/modules/direcciones/` (conftest.py, test_router.py), `backend/app/modules/router.py` (registro del router), `backend/app/uow.py` (repositorio direcciones).
- **Frontend**: `frontend/src/features/checkout/AddressList.tsx`, `frontend/src/features/checkout/AddressForm.tsx`, `frontend/src/features/checkout/api.ts` (tipos DireccionEntrega/DireccionCreate/DireccionUpdate).
- **Base de datos**: tabla `direccionentrega` en migración `0006_pedidos`.
