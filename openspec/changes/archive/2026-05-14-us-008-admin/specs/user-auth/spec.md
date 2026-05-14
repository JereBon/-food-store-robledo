## MODIFIED Requirements

### Requirement: Login de usuario inactivo retorna 403
El sistema SHALL retornar HTTP 403 (en lugar de 401) cuando un usuario intenta iniciar sesión y su cuenta está desactivada (`is_active=false`).

#### Scenario: Login con cuenta desactivada
- **WHEN** un usuario con `is_active=false` envía credenciales correctas
- **THEN** el sistema retorna HTTP 403 con mensaje "Cuenta desactivada"
