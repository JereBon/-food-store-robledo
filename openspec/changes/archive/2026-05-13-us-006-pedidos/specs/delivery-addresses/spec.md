# delivery-addresses Specification

## Purpose
CRUD de direcciones de entrega del cliente: primera dirección predeterminada automáticamente, solo una predeterminada a la vez, ownership estricto por usuario.

## ADDED Requirements

### Requirement: Client can add a delivery address
The system SHALL allow authenticated clients to create delivery addresses via `POST /api/v1/direcciones`. The first address SHALL be automatically set as default.

#### Scenario: First address becomes default automatically
- **WHEN** client with no existing addresses creates their first address
- **THEN** DireccionEntrega.es_predeterminada = true

#### Scenario: Subsequent addresses are not default
- **WHEN** client already has one address and creates a second
- **THEN** new address has es_predeterminada = false; existing default unchanged

#### Scenario: Invalid data returns 422
- **WHEN** client submits address without required field `calle`
- **THEN** system returns 422 Unprocessable Entity

### Requirement: Client can list their delivery addresses
The system SHALL provide `GET /api/v1/direcciones` returning all non-deleted addresses of the authenticated client.

#### Scenario: Returns only own addresses
- **WHEN** client requests GET /api/v1/direcciones
- **THEN** system returns only addresses with usuario_id matching the JWT token

#### Scenario: Empty list when no addresses
- **WHEN** client has no addresses
- **THEN** system returns 200 with empty array

### Requirement: Client can update a delivery address
The system SHALL allow clients to update any of their own addresses via `PATCH /api/v1/direcciones/{id}`.

#### Scenario: Own address updated successfully
- **WHEN** client sends PATCH with new street value for their own address
- **THEN** system updates and returns the modified address

#### Scenario: Another user's address returns 403
- **WHEN** client attempts to update an address belonging to another user
- **THEN** system returns 403 Forbidden

### Requirement: Client can delete a delivery address
The system SHALL allow clients to delete (soft-delete) their own addresses via `DELETE /api/v1/direcciones/{id}`.

#### Scenario: Own address soft-deleted
- **WHEN** client sends DELETE for their own address
- **THEN** address is soft-deleted (deleted_at set); GET /api/v1/direcciones no longer returns it

#### Scenario: Cannot delete another user's address
- **WHEN** client sends DELETE for another user's address
- **THEN** system returns 403 Forbidden

### Requirement: Only one address can be default at a time
The system SHALL enforce that exactly one address per user is marked as default. When a new address is set as default, the previous default SHALL be automatically unset.

#### Scenario: Set address as default
- **WHEN** client sends PATCH /api/v1/direcciones/{id}/predeterminada
- **THEN** that address becomes es_predeterminada=true; previous default becomes es_predeterminada=false

#### Scenario: First remaining address becomes default after default is deleted
- **WHEN** client deletes their only default address and has other addresses
- **THEN** the next available address becomes the new default

### Requirement: Address ownership validated on every mutation
The system SHALL verify that the `usuario_id` of the address matches the authenticated user's ID on every create, update, delete, and set-default operation.

#### Scenario: Ownership check on update
- **WHEN** user A attempts to modify address owned by user B
- **THEN** system returns 403 Forbidden regardless of the address ID

#### Scenario: Non-existent address returns 404
- **WHEN** client requests an address ID that does not exist
- **THEN** system returns 404 Not Found
