# frontend-foundation Specification

## Purpose
TBD - created by archiving change us-000-setup. Update Purpose after archive.
## Requirements
### Requirement: Frontend follows Feature-Sliced Design structure
El frontend SHALL organizarse siguiendo FSD con las carpetas `app/`, `pages/`, `widgets/`, `features/`, `entities/` y `shared/`.

#### Scenario: FSD layers exist in repository
- **WHEN** se inspecciona `frontend/src`
- **THEN** existen las carpetas de capas FSD y la convención de imports puede respetarse (capas superiores solo importan de inferiores)

### Requirement: Zustand stores exist for core client state
El frontend SHALL proveer cuatro stores Zustand: `authStore`, `cartStore`, `paymentStore` y `uiStore`, con acciones base y persistencia donde corresponda.

#### Scenario: Stores are available to features and pages
- **WHEN** una página o feature necesita estado del cliente (sesión, carrito, pago o UI)
- **THEN** puede consumir el store correspondiente sin acoplarse a implementaciones internas de otras features

### Requirement: HTTP client is configured for API calls
El frontend SHALL incluir una configuración base de HTTP (por ejemplo Axios) con URL del backend por variable de entorno y soporte para adjuntar credenciales de sesión (token) desde `authStore`.

#### Scenario: API calls include auth token when available
- **WHEN** el usuario está autenticado y existe token en `authStore`
- **THEN** las requests al backend incluyen el header `Authorization: Bearer <token>` según la configuración compartida

### Requirement: Frontend uses Vite + React + TypeScript strict
El frontend SHALL estar creado con Vite + React + TypeScript y tener TypeScript configurado en modo `strict`.

#### Scenario: TypeScript strict mode is enabled
- **WHEN** se inspecciona la configuración de TypeScript
- **THEN** `strict` está habilitado

### Requirement: Frontend includes TanStack Query for server state
El frontend SHALL incluir TanStack Query para gestión del estado del servidor (fetching/caché/reintentos).

#### Scenario: QueryClient is available in app providers
- **WHEN** se inicializa la aplicación
- **THEN** existe un QueryClientProvider configurado para que pages/features puedan definir queries

### Requirement: Frontend includes routing and role-based protection
El frontend SHALL incluir React Router y una abstracción `ProtectedRoute` tipo HOC para restringir acceso por rol.

#### Scenario: Unauthorized user is redirected from protected route
- **WHEN** un usuario sin sesión intenta acceder a una ruta protegida
- **THEN** el sistema lo redirige a login (o equivalente definido)

#### Scenario: User without required role is blocked
- **WHEN** un usuario autenticado sin el rol requerido accede a una ruta protegida por rol
- **THEN** el sistema bloquea el acceso (redirect o pantalla 403) según la política definida

### Requirement: Frontend includes Tailwind CSS
El frontend SHALL incluir Tailwind CSS configurado para estilos utility-first.

#### Scenario: Tailwind is available for UI styling
- **WHEN** un componente usa clases de Tailwind
- **THEN** se aplican correctamente en desarrollo

