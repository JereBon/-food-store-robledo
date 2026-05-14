## 1. Backend — Admin Repository y UnitOfWork

- [x] 1.1 Implementar `AdminRepository` en `backend/app/modules/admin/repository.py` con métodos: `list_users(q, rol, page, page_size)`, `get_user_by_id(id)`, `update_user(id, data)`, `count_admins()`
- [x] 1.2 Agregar queries de métricas al `AdminRepository`: `get_resumen(desde, hasta)`, `get_ventas_series(desde, hasta, granularidad)`, `get_top_productos(desde, hasta, limite)`
- [x] 1.3 Registrar `AdminRepository` en `UnitOfWork` como atributo `admin` (importar y asignar en `__enter__`)

## 2. Backend — Schemas y Service Admin

- [x] 2.1 Crear schemas en `backend/app/modules/admin/schemas.py`: `UserListItem`, `UserListResponse` (paginado), `UserUpdateRequest`, `MetricasResumenResponse`, `VentasPorPeriodoResponse`, `TopProductosResponse`
- [x] 2.2 Implementar `admin/service.py`: `list_users()`, `get_user()`, `update_user()` (con lógica RN-RB04: no degradar último ADMIN), `get_metricas_resumen()`, `get_ventas_series()`, `get_top_productos()`

## 3. Backend — Router Admin y correcciones RBAC

- [x] 3.1 Implementar `admin/router.py` con endpoints: `GET /api/admin/usuarios`, `PUT /api/admin/usuarios/{id}`, `GET /api/admin/metricas/resumen`, `GET /api/admin/metricas/ventas`, `GET /api/admin/metricas/productos-top` — todos con `Depends(require_role("ADMIN"))`
- [x] 3.2 Registrar el router admin en `backend/app/modules/router.py` bajo el prefijo `/admin`
- [x] 3.3 Corregir `auth/service.py`: cambiar `HTTP_401_UNAUTHORIZED` → `HTTP_403_FORBIDDEN` en la validación `not user.is_active`
- [x] 3.4 Revisar guards en routers de `productos`, `categorias`, `ingredientes` y `pedidos` — agregar rol `ADMIN` donde solo admitan `STOCK` o `PEDIDOS`

## 4. Frontend — Instalación de dependencias y API client

- [x] 4.1 Instalar `recharts` en frontend: `npm install recharts` (ejecutar en `frontend/`)
- [x] 4.2 Crear `frontend/src/features/admin/api.ts` con funciones: `listUsers(params)`, `updateUser(id, data)`, `getMetricasResumen(params)`, `getVentasSeries(params)`, `getTopProductos(params)`

## 5. Frontend — AdminLayout y página de Usuarios

- [x] 5.1 Crear `frontend/src/shared/layouts/AdminLayout.tsx` con sidebar de navegación que incluya links a: Productos, Categorías, Ingredientes, Usuarios, Dashboard
- [x] 5.2 Crear `frontend/src/pages/admin/users/UsersPage.tsx` con tabla paginada que muestre: nombre, email, roles (badges), estado (activo/inactivo), y acciones
- [x] 5.3 Agregar en `UsersPage` barra de búsqueda (input texto) y selector de filtro por rol
- [x] 5.4 Crear modal/drawer de edición en `UsersPage` con formulario para editar nombre, apellido, teléfono, roles y estado del usuario
- [x] 5.5 Exportar `UsersPage` desde `frontend/src/pages/admin/users/index.ts`

## 6. Frontend — Dashboard de métricas

- [x] 6.1 Crear `frontend/src/pages/admin/dashboard/DashboardPage.tsx` con selector de rango de fechas
- [x] 6.2 Agregar cards de resumen en `DashboardPage`: total ventas, total pedidos, usuarios registrados
- [x] 6.3 Agregar `<LineChart>` de recharts en `DashboardPage` para evolución de ventas con selector de granularidad (día/semana/mes)
- [x] 6.4 Agregar `<BarChart>` de recharts en `DashboardPage` para top 10 productos más vendidos
- [x] 6.5 Exportar `DashboardPage` desde `frontend/src/pages/admin/dashboard/index.ts`

## 7. Frontend — Rutas y navegación

- [x] 7.1 Registrar rutas en `AppRouter.tsx`: `/admin/usuarios` → `UsersPage` y `/admin/dashboard` → `DashboardPage`, ambas con `ProtectedRoute roles={['ADMIN']}` y envueltas en `AdminLayout`
- [x] 7.2 Agregar links de navegación admin (Usuarios, Dashboard) al header o navbar existente cuando el usuario tiene rol ADMIN
