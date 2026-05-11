## MODIFIED Requirements

### Requirement: Backend supports rate limiting configuration
El backend SHALL incluir infraestructura para rate limiting basada en slowapi, preparada para aplicarse a endpoints sensibles (por ejemplo, login).

#### Scenario: Limiter is wired and reusable
- **WHEN** un router marca un endpoint con la política de rate limiting configurada
- **THEN** el sistema puede responder HTTP 429 al exceder la cuota, usando la infraestructura compartida del bootstrap

### Requirement: Auth dependencies are available for RBAC
El backend SHALL proveer dependencias reutilizables `get_current_user` y `require_role()` para autenticar requests y proteger rutas por rol.

#### Scenario: Protected endpoint rejects unauthenticated access
- **WHEN** se accede a un endpoint protegido sin token válido
- **THEN** el sistema responde HTTP 401

#### Scenario: Protected endpoint rejects insufficient role
- **WHEN** se accede a un endpoint protegido con un usuario sin el rol requerido
- **THEN** el sistema responde HTTP 403

## ADDED Requirements

### Requirement: Registro crea usuario CLIENT sin rol en request
El backend SHALL asignar automáticamente el rol CLIENT al registrar usuarios nuevos y SHALL ignorar cualquier rol provisto en el request.

#### Scenario: Rol CLIENT asignado automaticamente
- **WHEN** el usuario se registra
- **THEN** el rol asignado es CLIENT y no se acepta rol desde el payload

### Requirement: Registro retorna tokens de autenticación
El backend SHALL devolver access token y refresh token al completar registro exitoso.

#### Scenario: Tokens devueltos en registro
- **WHEN** el registro se completa correctamente
- **THEN** la respuesta incluye access token (30 min) y refresh token (7 días)
