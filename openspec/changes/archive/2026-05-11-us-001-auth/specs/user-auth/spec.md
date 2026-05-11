## ADDED Requirements

### Requirement: Cliente puede registrarse con email único
El sistema SHALL permitir que un usuario se registre como cliente usando email único y contraseña válida.

#### Scenario: Registro exitoso
- **WHEN** el usuario envía un email no registrado y contraseña válida
- **THEN** se crea la cuenta con rol CLIENT asignado automáticamente

#### Scenario: Email duplicado
- **WHEN** el usuario intenta registrar un email ya existente
- **THEN** el sistema responde error "El email ya esta registrado"

### Requirement: Contraseña se valida y se almacena hasheada
El sistema SHALL rechazar contraseñas con menos de 8 caracteres y SHALL almacenar contraseñas hasheadas con bcrypt (cost factor >= 10).

#### Scenario: Contraseña inválida por longitud
- **WHEN** el usuario registra una contraseña con menos de 8 caracteres
- **THEN** el sistema rechaza el registro

#### Scenario: Contraseña almacenada con hashing seguro
- **WHEN** se persiste un usuario nuevo
- **THEN** la contraseña se almacena hasheada con bcrypt (cost factor >= 10)

### Requirement: Registro devuelve tokens de autenticación
El sistema SHALL devolver un par de tokens (access + refresh) tras un registro exitoso.

#### Scenario: Registro devuelve access y refresh token
- **WHEN** el registro se completa correctamente
- **THEN** la respuesta incluye access token (30 min) y refresh token (7 días)
