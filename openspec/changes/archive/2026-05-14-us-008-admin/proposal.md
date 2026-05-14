## Why

El sistema carece de un panel de administración que le permita al rol ADMIN gestionar usuarios, supervisar el estado del negocio y operar el catálogo/pedidos sin depender de otros roles. Con los módulos de pedidos y pagos completos (us-006, us-007), el negocio ya genera datos de valor que necesitan ser visualizados y administrados.

## What Changes

- **Nuevo endpoint** `GET /api/admin/usuarios`: listado paginado de usuarios con búsqueda por nombre/email y filtro por rol.
- **Nuevo endpoint** `PUT /api/admin/usuarios/:id`: edición de datos, roles y estado (activo/inactivo) de cualquier usuario.
- **Soft-deactivation**: campo `activo` en `Usuario`; login devuelve 403 si `activo=false`; todos los refresh tokens del usuario se invalidan al desactivar.
- **Nuevos endpoints de métricas**: resumen general, evolución de ventas (con granularidad), y top productos más vendidos.
- **Frontend — panel admin**: rutas protegidas `/admin/*` con layout propio, tabla de usuarios, formulario de edición de rol, y dashboard con gráficos `recharts`.
- **RBAC ampliado**: endpoints de gestión de catálogo y pedidos ahora aceptan rol `ADMIN` además de `STOCK`/`PEDIDOS`.
- **Regla RN-RB04 aplicada**: ADMIN no puede degradarse si es el último administrador del sistema.

## Capabilities

### New Capabilities

- `admin-user-management`: Listado paginado, búsqueda, filtro por rol, edición de datos/rol y activación/desactivación de usuarios. Solo accesible con rol ADMIN.
- `admin-metrics-dashboard`: Dashboard con métricas agregadas (ventas totales, pedidos por estado, usuarios registrados, top productos). Gráfico de evolución de ventas con granularidad día/semana/mes usando recharts.

### Modified Capabilities

- `user-auth`: Validación de campo `activo` durante login — retorna HTTP 403 "Cuenta desactivada" si el usuario está inactivo.
- `product-crud`: Guards de endpoints de gestión de catálogo actualizados para aceptar `ADMIN` además de `STOCK`.

## Impact

- **Backend**: nuevos routers `admin/usuarios` y `admin/metricas` bajo `/api/admin/`; queries de agregación SQL (`SUM`, `COUNT`, `GROUP BY`, `DATE_TRUNC`); invalidación de refresh tokens al desactivar usuario.
- **Frontend**: nuevas páginas bajo `/admin/`; dependencia nueva `recharts`; guards de ruta basados en rol ADMIN.
- **Base de datos**: columna `activo BOOLEAN DEFAULT TRUE` en tabla `usuarios`; migración Alembic requerida.
- **Módulos afectados**: `user-auth` (login check), `product-crud` (RBAC guards), módulo de pedidos (RBAC guards).
