# database-migrations-seed Specification

## Purpose
TBD - created by archiving change us-000-setup. Update Purpose after archive.
## Requirements
### Requirement: Alembic migrations are configured
El proyecto SHALL incluir Alembic configurado para generar y ejecutar migraciones contra PostgreSQL, versionando el esquema de base de datos.

#### Scenario: Database can be upgraded to latest schema
- **WHEN** existe una base de datos vacía y se ejecuta el comando de migración a la última versión
- **THEN** se crean las tablas del modelo sin errores y el esquema queda alineado a la versión actual

### Requirement: Seed data is idempotent and complete
El sistema SHALL incluir un script de seed data idempotente que cargue los datos mínimos obligatorios para operar.

#### Scenario: Seeding can be re-run without duplication
- **WHEN** se ejecuta el seed script múltiples veces
- **THEN** no se duplican registros y los catálogos quedan en un estado consistente

#### Scenario: Required catalogs exist after seed
- **WHEN** el seed script finaliza correctamente
- **THEN** existen los roles (ADMIN, STOCK, PEDIDOS, CLIENT), los estados de pedido (PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO), formas de pago mínimas y un usuario administrador inicial

### Requirement: Seed IDs are stable
Los catálogos creados por seed SHALL usar identificadores/códigos estables para ser referenciados desde el código (RBAC y FSM).

#### Scenario: Code can safely reference seeded identifiers
- **WHEN** el backend valida roles o estados de pedido
- **THEN** puede referenciar identificadores/códigos estables que no cambian entre ambientes

