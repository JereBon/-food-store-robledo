## MODIFIED Requirements

### Requirement: HTTP client is configured for API calls
El frontend SHALL incluir una configuración base de HTTP (por ejemplo Axios) con URL del backend por variable de entorno y soporte para adjuntar credenciales de sesión (token) desde `authStore`.

#### Scenario: API calls include auth token when available
- **WHEN** el usuario está autenticado y existe token en `authStore`
- **THEN** las requests al backend incluyen el header `Authorization: Bearer <token>` según la configuración compartida

## ADDED Requirements

### Requirement: Registro de cliente disponible en frontend
El frontend SHALL proveer un flujo de registro de cliente con validaciones de email único y contraseña mínima (>= 8 caracteres).

#### Scenario: Registro exitoso en frontend
- **WHEN** el usuario completa el formulario con email no registrado y contraseña válida
- **THEN** la UI muestra confirmación y se almacenan tokens en `authStore`

#### Scenario: Error de email duplicado en frontend
- **WHEN** el backend responde que el email ya está registrado
- **THEN** la UI muestra el mensaje de error correspondiente
