## Tasks

### Backend

- [x] Crear `backend/app/modules/direcciones/model.py` — modelo `DireccionEntrega` con SQLModel y soft-delete (`deleted_at`)
- [x] Crear `backend/app/modules/direcciones/schemas.py` — schemas `DireccionCreate`, `DireccionUpdate`, `DireccionResponse`
- [x] Crear `backend/app/modules/direcciones/repository.py` — `DireccionRepository` con queries por usuario, soft-delete, restore y set_default atómico
- [x] Crear `backend/app/modules/direcciones/service.py` — `DireccionService` con reglas: auto-predeterminada en primera dirección, promoción al eliminar predeterminada
- [x] Crear `backend/app/modules/direcciones/router.py` — 7 endpoints REST con auth JWT y ownership check
- [x] Registrar router en `backend/app/modules/router.py`
- [x] Agregar repositorio `direcciones` a `backend/app/uow.py`

### Database

- [x] Tabla `direccionentrega` incluida en migración `0006_pedidos` (`backend/alembic/versions/0006_pedidos.py`)

### Frontend

- [x] Crear `frontend/src/features/checkout/AddressForm.tsx` — formulario crear/editar con validación client-side
- [x] Crear `frontend/src/features/checkout/AddressList.tsx` — lista con radio-select, acciones inline y sección de eliminadas recuperables
- [x] Definir tipos `DireccionEntrega`, `DireccionCreate`, `DireccionUpdate` en `frontend/src/features/checkout/api.ts`
- [x] Integrar `AddressList` y `AddressForm` en la página de checkout (`frontend/src/pages/checkout/index.tsx`)

### Tests

- [x] Crear `backend/tests/modules/direcciones/test_router.py` — 8 tests cubriendo: create, auto-default, list, update, delete, set_default, ownership check, auth requerida
- [x] Crear `backend/tests/modules/direcciones/conftest.py`
