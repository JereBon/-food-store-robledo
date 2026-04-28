## 1. Repositorio y documentación base

- [x] 1.1 Crear estructura de monorepo con `backend/` y `frontend/`
- [x] 1.2 Agregar `.gitignore` y archivos `.env.example` (backend y frontend) con variables documentadas
- [x] 1.3 Agregar `README.md` raíz con pasos de setup (backend, frontend, DB, migraciones y seed)

## 2. Backend — scaffold y bootstrap

- [x] 2.1 Crear proyecto FastAPI con entrypoint y configuración centralizada (env/config)
- [x] 2.2 Configurar CORS desde `CORS_ORIGINS` (incluir `http://localhost:5173` en desarrollo)
- [x] 2.3 Integrar slowapi (limiter) en el bootstrap y dejar utilidades listas para decorar endpoints sensibles
- [x] 2.4 Crear estructura feature-first por módulos con placeholders de capas (model/schemas/repository/service/router)
- [x] 2.5 Agregar dependencias de auth: `get_current_user` y `require_role()` (RBAC)

## 3. Backend — patrones base (Repository + UoW)

- [x] 3.1 Implementar `BaseRepository[T]` genérico con operaciones CRUD estandarizadas
- [x] 3.2 Implementar `UnitOfWork` como context manager (commit/rollback automático) y sesión compartida
- [x] 3.3 Documentar convenciones de imports/capas (Router → Service → UoW → Repository → Model)

## 4. Base de datos — Alembic + seed

- [x] 4.1 Configurar engine/session de PostgreSQL y conexión por `DATABASE_URL`
- [x] 4.2 Configurar Alembic y dejar listo el workflow de migraciones
- [x] 4.3 Implementar seed idempotente con roles, estados de pedido, formas de pago y usuario admin

## 5. Frontend — scaffold FSD + stores

- [x] 5.1 Crear proyecto React + TypeScript + Vite bajo `frontend/`
- [x] 5.2 Aplicar estructura FSD en `frontend/src` (app/pages/widgets/features/entities/shared)
- [x] 5.3 Implementar `authStore`, `cartStore`, `paymentStore` y `uiStore` con Zustand (persistencia según corresponda)
- [x] 5.4 Configurar cliente HTTP (p.ej. Axios) con base URL por env y soporte de interceptor con token desde `authStore`
- [x] 5.5 Configurar TypeScript `strict`
- [x] 5.6 Integrar TanStack Query (QueryClientProvider) como provider de app
- [x] 5.7 Integrar React Router y `ProtectedRoute` (HOC) para protección por rol
- [x] 5.8 Integrar Tailwind CSS y estilos base
