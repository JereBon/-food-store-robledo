# backend-foundation Specification

## Purpose
TBD - created by archiving change us-000-setup. Update Purpose after archive.
## Requirements
### Requirement: Backend uses feature-first module layout
El backend SHALL estar organizado por módulos feature-first, donde cada módulo contiene sus capas internas (model/schemas/repository/service/router) y comparte cross-cutting en un `core`/`config` común.

#### Scenario: Module scaffold exists for core domains
- **WHEN** se clona el repositorio y se inspecciona `backend/`
- **THEN** existen módulos para `auth`, `usuarios`, `productos`, `ingredientes`, `categorias`, `pedidos`, `pagos`, `direcciones`, `admin` y `refreshtokens` con archivos placeholder de sus capas

### Requirement: Backend uses SQLModel as ORM
El backend SHALL usar SQLModel como ORM y fuente de truth de los modelos, de forma compatible con Alembic para migraciones.

#### Scenario: Models can be used for persistence and migrations
- **WHEN** el proyecto se configura contra PostgreSQL
- **THEN** existen modelos SQLModel base y una sesión/engine configurados para permitir queries y generación/ejecución de migraciones

### Requirement: FastAPI app bootstrap is configured
La aplicación FastAPI SHALL iniciar con configuración centralizada, registrar routers bajo el prefijo `/api/v1`, exponer `/docs` y `/redoc`, y configurar CORS desde variables de entorno.

#### Scenario: Application starts with documented defaults
- **WHEN** el desarrollador ejecuta el servidor en modo desarrollo
- **THEN** la app arranca sin errores, la documentación está disponible, y CORS permite `http://localhost:5173` cuando está incluido en `CORS_ORIGINS`

### Requirement: Backend supports rate limiting configuration
El backend SHALL incluir infraestructura para rate limiting basada en slowapi, preparada para aplicarse a endpoints sensibles (por ejemplo, login).

#### Scenario: Limiter is wired and reusable
- **WHEN** un router marca un endpoint con la política de rate limiting configurada
- **THEN** el sistema puede responder HTTP 429 al exceder la cuota, usando la infraestructura compartida del bootstrap

### Requirement: BaseRepository generic exists
El backend SHALL proveer un `BaseRepository[T]` genérico con operaciones CRUD comunes, para minimizar duplicación y estandarizar acceso a datos. Los repositorios concretos (`ProductRepository`, `IngredienteRepository`) SHALL heredar de `BaseRepository`.

#### Scenario: Repository exposes the standard operations
- **WHEN** un módulo implementa un repositorio concreto para una entidad
- **THEN** puede heredar y reutilizar `get_by_id`, `list_all`, `count`, `create`, `update`, `soft_delete` y `hard_delete` (o equivalentes definidos) sin reimplementar lógica común

#### Scenario: ProductRepository inherits from BaseRepository
- **WHEN** se inspecciona `app/modules/productos/repository.py`
- **THEN** ProductRepository extiende `BaseRepository[Product]` y agrega métodos específicos del dominio

#### Scenario: IngredienteRepository inherits from BaseRepository
- **WHEN** se inspecciona `app/modules/ingredientes/repository.py`
- **THEN** IngredienteRepository extiende `BaseRepository[Ingrediente]` y agrega métodos específicos

### Requirement: Unit of Work manages transactions
El backend SHALL proveer un `UnitOfWork` que gestione la sesión de base de datos y garantice commit/rollback automático alrededor de operaciones de negocio.

#### Scenario: Transaction commits on success and rolls back on error
- **WHEN** un service ejecuta una operación dentro del contexto UoW y no lanza excepciones
- **THEN** la transacción se confirma
- **WHEN** ocurre una excepción durante la operación
- **THEN** la transacción se revierte y no quedan cambios parciales persistidos

### Requirement: Auth dependencies are available for RBAC
El backend SHALL proveer dependencias reutilizables `get_current_user` y `require_role()` para autenticar requests y proteger rutas por rol.

#### Scenario: Protected endpoint rejects unauthenticated access
- **WHEN** se accede a un endpoint protegido sin token válido
- **THEN** el sistema responde HTTP 401

#### Scenario: Protected endpoint rejects insufficient role
- **WHEN** se accede a un endpoint protegido con un usuario sin el rol requerido
- **THEN** el sistema responde HTTP 403

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

