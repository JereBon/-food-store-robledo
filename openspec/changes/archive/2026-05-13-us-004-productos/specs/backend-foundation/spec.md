## MODIFIED Requirements

### Requirement: Backend uses feature-first module layout
El backend SHALL estar organizado por módulos feature-first, donde cada módulo contiene sus capas internas (model/schemas/repository/service/router) y comparte cross-cutting en un `core`/`config` común.

#### Scenario: Module scaffold exists for core domains
- **WHEN** se clona el repositorio y se inspecciona `backend/`
- **THEN** existen módulos para `auth`, `usuarios`, `productos`, `ingredientes`, `categorias`, `pedidos`, `pagos`, `direcciones`, `admin` y `refreshtokens` con archivos de sus capas

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
