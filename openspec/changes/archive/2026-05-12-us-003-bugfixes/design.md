# Design — US-003 Bugfixes (Estabilización Post-Integración)

## Enfoque
La estabilización se centró en corregir puntos de fallo críticos que rompían el flujo end-to-end de Auth y Categorías. Se priorizó restablecer el contrato de autenticación, la consistencia transaccional en backend y la inyección de token en frontend para garantizar integraciones seguras y trazables.

## Backend
### 1) Endpoint de Login
- **Problema**: Faltaba el endpoint `POST /api/v1/auth/login`, lo que bloqueaba el flujo de autenticación.
- **Solución**: Se añadió el endpoint y se integró la verificación de contraseñas en el servicio de Auth.

### 2) Unit of Work y `DetachedInstanceError`
- **Problema**: Errores `DetachedInstanceError` luego de commits, por expiración automática de instancias.
- **Solución**: Configuración `expire_on_commit=False` en la sesión del UnitOfWork para mantener entidades vivas post-commit.
- **Patrón reforzado**: UoW como único responsable de transacciones; los servicios no hacen commit/rollback.

### 3) Router de Categorías y Commit
- **Problema**: Uso incorrecto de `uow.commit()` en el router, lo que generaba `AttributeError`.
- **Solución**: Ajuste a `uow.session.commit()` siguiendo el contrato del UoW.

### 4) Seed de Admin
- **Problema**: El usuario admin de pruebas no recibía el rol `ADMIN` correctamente.
- **Solución**: Corrección de `seed.py` para asignar el rol explícitamente.

## Frontend
### 1) Auth UI + Persistencia
- **Problema**: Falta de formularios de login/registro conectados al backend.
- **Solución**: Creación e integración de `LoginForm.tsx` y `RegisterForm.tsx` con TanStack Query y persistencia en `authStore` (Zustand).

### 2) Cliente HTTP unificado
- **Problema**: `categories/api.ts` usaba `fetch`, evitando el interceptor de Axios y provocando `401 Unauthorized`.
- **Solución**: Migración a cliente global `http` con interceptor que inyecta el token desde Zustand.
- **Patrón reforzado**: Todas las llamadas autenticadas pasan por el cliente global (interceptor centralizado).

### 3) RBAC en Navbar
- **Problema**: Roles leídos desde `user` en vez de desde el array de roles del store.
- **Solución**: Extracción de roles desde el store para resolver visibilidad de acciones (Categorías).

### 4) ProtectedRoute
- **Problema**: Redirección a `/403` inexistente.
- **Solución**: Redirección a `/` como fallback correcto.

### 5) UX de Categorías en español
- **Problema**: UI inconsistente y textos en diferentes idiomas.
- **Solución**: Unificación de textos y etiquetas en español para listados, formularios y modales.

## Trade-offs
- Se priorizó estabilidad sobre nuevas features; se documenta como change separado para trazabilidad.
