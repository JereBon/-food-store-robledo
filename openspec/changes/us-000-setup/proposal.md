## Why

Food Store necesita una base de infraestructura y convenciones compartidas antes de implementar cualquier feature, para que el equipo pueda avanzar rápido sin re-trabajo ni decisiones inconsistentes. Este change define el “terreno” (estructura, bootstrap, patrones core y configuración transversal) sobre el que dependen todos los changes siguientes.

## What Changes

- Crear estructura de monorepo con separación clara `backend/` y `frontend/`.
- Backend (FastAPI):
  - Estructura **feature-first** por módulos (`auth/`, `usuarios/`, `productos/`, `categorias/`, `ingredientes/`, `pedidos/`, `pagos/`, `direcciones/`, `admin/`, `refreshtokens/`).
  - Implementar patrones base: `BaseRepository[T]` y `Unit of Work (UoW)`.
  - Bootstrap de aplicación: configuración de CORS por variable de entorno, registro de routers con prefijo `/api/v1`, y soporte de rate limiting (slowapi) preparado para endpoints sensibles.
- Base de datos:
  - Alembic configurado para migraciones.
  - Seed data idempotente con datos obligatorios (roles, estados de pedido, formas de pago, usuario admin).
- Frontend (React + Vite):
  - Estructura **Feature-Sliced Design (FSD)** (`app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`).
  - 4 stores de Zustand (auth/cart/payment/ui) con persistencia según corresponda.
- Documentación mínima y variables de entorno de ejemplo (`.env.example`) para que cualquier compañero pueda levantar el proyecto.

## Capabilities

### New Capabilities
- `backend-foundation`: Base del backend (estructura feature-first, bootstrap FastAPI, BaseRepository[T], Unit of Work, CORS y rate limiting).
- `database-migrations-seed`: Migraciones y seed de base de datos (Alembic + script idempotente con datos semilla obligatorios).
- `frontend-foundation`: Base del frontend (estructura FSD, stores Zustand y configuración HTTP base).

### Modified Capabilities
- (none)

## Impact

- Afecta toda la estructura del repositorio y establece convenciones de arquitectura para backend y frontend.
- Define contratos base (patrones de acceso a datos/transacciones) que usarán todos los módulos.
- Introduce dependencias y configuración transversal (Alembic, slowapi, CORS, Zustand persist).
