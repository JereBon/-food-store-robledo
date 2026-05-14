## ADDED Requirements

### Requirement: Admin puede listar usuarios del sistema
El sistema SHALL exponer `GET /api/admin/usuarios` que retorna todos los usuarios registrados con paginación, búsqueda y filtro por rol. Solo accesible con rol ADMIN.

#### Scenario: Listado paginado exitoso
- **WHEN** un Admin autenticado solicita `GET /api/admin/usuarios`
- **THEN** el sistema retorna una lista paginada con campos: id, nombre, apellido, email, roles, is_active, created_at

#### Scenario: Búsqueda por nombre o email
- **WHEN** el Admin envía `?q=texto` en la query string
- **THEN** el sistema retorna solo usuarios cuyo nombre, apellido o email contienen el texto (case-insensitive)

#### Scenario: Filtro por rol
- **WHEN** el Admin envía `?rol=STOCK` en la query string
- **THEN** el sistema retorna solo usuarios que tienen el rol especificado

#### Scenario: Acceso denegado a no-Admin
- **WHEN** un usuario sin rol ADMIN accede al endpoint
- **THEN** el sistema retorna HTTP 403

### Requirement: Admin puede editar datos, roles y estado de cualquier usuario
El sistema SHALL exponer `PUT /api/admin/usuarios/:id` que permite al Admin modificar nombre, apellido, teléfono, roles y estado (is_active) de un usuario.

#### Scenario: Edición de rol exitosa
- **WHEN** el Admin envía un nuevo conjunto de roles para el usuario
- **THEN** el sistema actualiza los roles y el próximo access token del usuario refleja el cambio

#### Scenario: Desactivación de usuario invalida tokens
- **WHEN** el Admin envía `is_active=false` para un usuario
- **THEN** el sistema marca al usuario como inactivo y revoca todos sus refresh tokens activos

#### Scenario: Admin no puede degradar al último ADMIN del sistema
- **WHEN** el Admin intenta remover el rol ADMIN a un usuario y ese usuario es el único con rol ADMIN
- **THEN** el sistema retorna HTTP 409 con mensaje "No se puede degradar al único administrador del sistema"

#### Scenario: Usuario inexistente
- **WHEN** el Admin envía un id que no existe
- **THEN** el sistema retorna HTTP 404
