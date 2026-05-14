## Context

El sistema tiene autenticación JWT+RBAC con 4 roles (ADMIN, STOCK, PEDIDOS, CLIENT), carrito, pedidos y pagos MercadoPago completamente implementados. El módulo `backend/app/modules/admin/` existe como placeholder (todos los archivos son `# placeholder`). El frontend ya tiene rutas `/admin/products`, `/admin/ingredients` y `/admin/categories` con `ProtectedRoute`.

Estado actual relevante:
- `User.is_active` ya existe en el modelo (campo `is_active: bool = Field(default=True)`).
- `auth/service.py` ya verifica `is_active` en login, pero retorna **401** en vez de **403**.
- `UnitOfWork` expone `users`, `refresh_tokens`, `pedidos`, `pagos` — falta un repositorio de admin.
- No se necesita migración Alembic para `is_active` (ya existe en BD).

## Goals / Non-Goals

**Goals:**
- Implementar `modules/admin/` (router, service, repository, schemas) con endpoints de usuarios y métricas.
- Exponer panel admin en frontend: tabla de usuarios + dashboard con gráficos recharts.
- Corregir código de estado en login de usuario inactivo: 401 → 403.
- Ampliar RBAC de gestión de catálogo y pedidos para aceptar rol ADMIN en backend (el frontend ya lo tiene).

**Non-Goals:**
- Gestión de stock desde el panel admin (ya existe en `/admin/products` e `/admin/ingredients`).
- Logs de auditoría o historial de cambios de roles.
- Exportación de reportes a CSV/PDF.
- Paginación de métricas (los rangos de fecha limitan el volumen).

## Decisions

### D1 — AdminRepository separado del UsersRepository

El `AdminRepository` vive en `modules/admin/repository.py` y accede a múltiples tablas (`User`, `Role`, `UserRole`, `RefreshToken`, `Order`, `Payment`). Mantenerlo separado de `UsersRepository` (que solo gestiona auth) respeta el principio de separación de responsabilidades y evita que el repositorio de auth crezca con lógica de negocio admin.

`UnitOfWork` recibe un nuevo atributo `admin: AdminRepository`.

### D2 — Métricas con SQLModel + raw SQL para agregaciones

Los endpoints de métricas requieren `SUM`, `COUNT GROUP BY`, `DATE_TRUNC`. Se implementan con `session.exec(text(...))` (SQLAlchemy raw SQL) dentro del `AdminRepository`, ya que SQLModel no tiene DSL para estas agregaciones y escribir texto SQL es más legible que encadenar `select().group_by()`.

Alternativa descartada: ORM puro con `func.sum` / `func.date_trunc` — más verboso, sin ganancia real de type-safety.

### D3 — Endpoint de ventas usa granularidad como query param

`GET /api/admin/metricas/ventas?desde=...&hasta=...&granularidad=dia|semana|mes`

La granularidad se valida con un `Literal` en el schema de Pydantic y se mapea a `DATE_TRUNC('day'|'week'|'month', ...)` en la query.

### D4 — Frontend: recharts se instala como dependencia directa

`recharts` se agrega a `frontend/package.json`. Se usa `LineChart` para evolución de ventas y `BarChart` para top productos. No se usa un wrapper abstracto — recharts es la librería especificada en las user stories.

### D5 — Rutas admin en frontend usan layout admin dedicado

Se crea `AdminLayout` con sidebar de navegación admin (usuarios, métricas). Las rutas `/admin/usuarios` y `/admin/dashboard` se envuelven con este layout y con `ProtectedRoute roles={['ADMIN']}`.

### D6 — Invalidación de refresh tokens al desactivar usuario

Al llamar `PUT /api/admin/usuarios/:id` con `is_active=false`, el servicio llama a `uow.refresh_tokens.revoke_all_for_user(user_id)` (método que ya existe en `RefreshTokensRepository` o se agrega ahí). Esto fuerza re-login y el login retornará 403.

### D7 — Corrección de código HTTP en login de usuario inactivo

`auth/service.py` line 76 cambia de `HTTP_401_UNAUTHORIZED` a `HTTP_403_FORBIDDEN` para el caso `not user.is_active`. El mensaje permanece "Cuenta desactivada".

## Risks / Trade-offs

- **Métricas con queries raw**: si el esquema de tablas cambia, las queries rompen silenciosamente en runtime. Mitigation: tests de integración que ejecuten cada endpoint de métricas contra la BD real.
- **`DATE_TRUNC` es PostgreSQL-specific**: si se necesita SQLite en tests, las queries raw fallan. Mitigation: los tests de métricas usan PostgreSQL (igual que producción); para tests unitarios, mockear el repositorio.
- **AdminRepository accede a múltiples módulos**: crea acoplamiento de datos. Trade-off aceptado — es la capa de reporting, no la capa de negocio.

## Migration Plan

1. Agregar `AdminRepository` y conectarlo al `UnitOfWork`.
2. Implementar `modules/admin/` (schemas → repository → service → router).
3. Registrar router admin en `modules/router.py`.
4. Corregir `auth/service.py` (401 → 403 para `is_active`).
5. Instalar `recharts` en frontend (`npm install recharts`).
6. Crear páginas frontend: `UsersPage`, `DashboardPage` y `AdminLayout`.
7. Registrar rutas `/admin/usuarios` y `/admin/dashboard` en `AppRouter.tsx`.

Rollback: los cambios en `auth/service.py` son de una línea; los endpoints admin son aditivos. No hay migraciones de BD.

## Open Questions

- ¿El endpoint de desactivación de usuario es `PUT /api/admin/usuarios/:id` (que edita todos los campos) o un endpoint dedicado `POST /api/admin/usuarios/:id/desactivar`? → Decisión: endpoint único `PUT /api/admin/usuarios/:id` que acepta cualquier campo editable, incluyendo `is_active` y `roles`.
- ¿Las métricas necesitan cache (Redis)? → No para el Sprint 8; las queries son sobre un dataset académico pequeño.
