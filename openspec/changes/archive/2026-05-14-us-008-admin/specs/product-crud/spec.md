## MODIFIED Requirements

### Requirement: Endpoints de gestión de catálogo aceptan rol ADMIN además de STOCK
El sistema SHALL permitir que usuarios con rol ADMIN accedan a todos los endpoints de gestión de catálogo (productos, categorías, ingredientes) con los mismos permisos que el rol STOCK.

#### Scenario: Admin gestiona productos
- **WHEN** un usuario con rol ADMIN accede a `POST /api/productos`, `PUT /api/productos/:id` o `DELETE /api/productos/:id`
- **THEN** el sistema procesa la operación correctamente (igual que un usuario STOCK)

#### Scenario: Admin gestiona categorías e ingredientes
- **WHEN** un usuario con rol ADMIN accede a los endpoints de creación, edición o eliminación de categorías e ingredientes
- **THEN** el sistema procesa la operación correctamente

### Requirement: Endpoints de gestión de pedidos aceptan rol ADMIN además de PEDIDOS
El sistema SHALL permitir que usuarios con rol ADMIN accedan a todos los endpoints de gestión de pedidos con los mismos permisos que el rol PEDIDOS.

#### Scenario: Admin gestiona estado de pedido
- **WHEN** un usuario con rol ADMIN accede a los endpoints de transición de estado de pedidos
- **THEN** el sistema procesa la operación correctamente (igual que un usuario PEDIDOS)
