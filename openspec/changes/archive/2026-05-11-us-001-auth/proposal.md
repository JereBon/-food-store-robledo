## Why

US-001 requiere registro seguro de clientes con reglas de negocio explícitas (hashing bcrypt, rol CLIENT automático y manejo de errores). Esto habilita el flujo básico de autenticación del e-commerce y prepara el sistema para login y refresh token.

## What Changes

- Se incorpora el registro de clientes con validaciones de email único y contraseña mínima.
- Se generan tokens de autenticación (access + refresh) al registrar correctamente.
- Se aplica hashing de contraseñas con bcrypt (cost factor >= 10) y se impide que el rol venga del request.
- Se definen respuestas de error específicas para email duplicado y contraseña inválida.

## Capabilities

### New Capabilities
- `user-auth`: Registro de usuario cliente, emisión de tokens y reglas de seguridad asociadas a autenticación.

### Modified Capabilities
- `backend-foundation`: Se amplían requerimientos para soporte de autenticación (JWT, hashing y refresh tokens) como parte de la base backend.
- `frontend-foundation`: Se agregan requerimientos de flujo de registro y manejo de tokens en el frontend.

## Impact

- Backend: nuevos endpoints/auth services, repositorios y modelos relacionados a usuarios y refresh tokens.
- Frontend: vistas de registro, manejo de sesión (tokens) y validaciones de formularios.
- Seguridad: hashing bcrypt, JWT HS256, almacenamiento/rotación de refresh tokens en BD.
