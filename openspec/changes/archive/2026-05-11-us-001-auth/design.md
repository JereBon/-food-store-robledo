## Context

El proyecto Food Store requiere autenticación basada en JWT con roles (RBAC). Para US-001 se debe permitir el registro de clientes con validaciones de email único, contraseña mínima y hashing seguro. El backend debe respetar la arquitectura Router → Service → UoW → Repository → Model, y el frontend debe usar Feature-Sliced Design con TanStack Query para datos remotos y Zustand para estado cliente.

## Goals / Non-Goals

**Goals:**
- Definir el flujo de registro de cliente (backend + frontend) con emisión de access/refresh tokens.
- Establecer el modelo de datos para usuarios y refresh tokens con revocación.
- Alinear manejo de errores con RFC 7807 y reglas de negocio (email duplicado, contraseña inválida).

**Non-Goals:**
- Implementar login, refresh o logout (US-002/US-003/US-004).
- Resolver integraciones de pago o estados de pedidos.

## Decisions

1) **JWT HS256 para access/refresh tokens**
- *Por qué*: está definido en los docs (Descripcion.txt) y simplifica la verificación sin infraestructura adicional.
- *Alternativas*: RS256 con claves asimétricas (más seguro para múltiples servicios, pero no necesario en este alcance).

2) **Refresh tokens persistidos en BD con revocación**
- *Por qué*: requerido por documentación (rotación e invalidación). Permite logout y control de sesión.
- *Alternativas*: refresh token stateless (más simple, pero sin revocación por usuario).

3) **Hashing de contraseñas con Passlib + bcrypt (cost >= 10)**
- *Por qué*: regla RN-AU01 explícita.
- *Alternativas*: Argon2 (mejor seguridad, pero no es el stack definido).

4) **Flujo de registro en frontend con TanStack Query**
- *Por qué*: datos remotos van por Query, estado local (tokens/UI) va por Zustand según arquitectura.
- *Alternativas*: manejar todo en Zustand (viola guardrail).

## Risks / Trade-offs

- **Persistencia de refresh tokens** → requiere migración y manejo de revocación. *Mitigación*: definir tabla RefreshToken y operaciones CRUD limitadas.
- **JWT HS256 compartido** → riesgo si se filtra la clave. *Mitigación*: rotación de secreto y variables de entorno seguras.
- **Mensajes de error específicos** → evitar filtrar si el email existe en login. *Mitigación*: aplicar reglas RN-AU08 solo en login; en registro sí se puede indicar email duplicado.
