# Documentación API — Gestión de Categorías

## Descripción

La API de Gestión de Categorías provee endpoints para administrar las categorías de productos del sistema Food Store. Las categorías organizan y filtran el catálogo de productos.

**URL Base:** `/api/v1/categorias`

**Autenticación:** Todos los endpoints requieren autenticación mediante JWT en el header `Authorization: Bearer {token}`.

---

## Endpoints

### 1. Crear Categoría

**Endpoint:** `POST /api/v1/categorias`

**Rol requerido:** ADMIN

**Request:**
```json
{
  "name": "Frutas",
  "description": "Frutas frescas y de temporada"
}
```

**Parámetros:**
- `name` (string, requerido): Nombre de la categoría (máx. 100 caracteres, debe ser único)
- `description` (string, opcional): Descripción de la categoría (máx. 500 caracteres)

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "name": "Frutas",
  "slug": "frutas",
  "description": "Frutas frescas y de temporada",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:30:00Z",
  "deleted_at": null
}
```

**Errores:**
- `400 Bad Request`: Nombre duplicado o datos inválidos
  ```json
  { "detail": "A category with name 'Frutas' already exists" }
  ```
- `403 Forbidden`: El usuario no tiene rol ADMIN
  ```json
  { "detail": "Insufficient permissions" }
  ```

---

### 2. Listar Categorías

**Endpoint:** `GET /api/v1/categorias`

**Parámetros de consulta:**
- `skip` (entero, opcional): Desplazamiento para paginación (default: 0)
- `limit` (entero, opcional): Cantidad máxima de resultados (default: 20)
- `include_deleted` (booleano, opcional): Incluir categorías eliminadas (default: false, solo ADMIN)

**Respuesta (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Frutas",
      "slug": "frutas",
      "description": "Frutas frescas y de temporada",
      "created_at": "2026-05-11T10:30:00Z",
      "updated_at": "2026-05-11T10:30:00Z",
      "deleted_at": null
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

**Nota:** Los usuarios sin rol ADMIN siempre reciben solo categorías activas, independientemente del parámetro `include_deleted`.

---

### 3. Obtener Categoría por ID

**Endpoint:** `GET /api/v1/categorias/{category_id}`

**Parámetros de ruta:**
- `category_id` (entero): ID de la categoría

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "name": "Frutas",
  "slug": "frutas",
  "description": "Frutas frescas y de temporada",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:30:00Z",
  "deleted_at": null
}
```

**Errores:**
- `404 Not Found`: La categoría no existe o está eliminada

---

### 4. Actualizar Categoría

**Endpoint:** `PUT /api/v1/categorias/{category_id}`

**Rol requerido:** ADMIN

**Parámetros de ruta:**
- `category_id` (entero): ID de la categoría a actualizar

**Request:**
```json
{
  "name": "Frutas Exóticas",
  "description": "Frutas tropicales de todo el mundo"
}
```

**Parámetros:**
- `name` (string, opcional): Nuevo nombre (si se provee, debe ser único)
- `description` (string, opcional): Nueva descripción

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "name": "Frutas Exóticas",
  "slug": "frutas-exoticas",
  "description": "Frutas tropicales de todo el mundo",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:45:00Z",
  "deleted_at": null
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o nombre duplicado
- `403 Forbidden`: El usuario no tiene rol ADMIN
- `404 Not Found`: La categoría no existe o está eliminada

---

### 5. Eliminar Categoría (Soft Delete)

**Endpoint:** `DELETE /api/v1/categorias/{category_id}`

**Rol requerido:** ADMIN

**Parámetros de ruta:**
- `category_id` (entero): ID de la categoría a eliminar

**Implementación:** Soft delete — establece el campo `deleted_at` con el timestamp actual en lugar de eliminar el registro físicamente. Las categorías eliminadas quedan ocultas en consultas públicas pero son visibles para ADMIN con `include_deleted=true`.

**Respuesta (204 No Content)**

**Errores:**
- `400 Bad Request`: La categoría tiene productos activos asociados
  ```json
  { "detail": "Cannot delete category with associated products" }
  ```
- `403 Forbidden`: El usuario no tiene rol ADMIN
- `404 Not Found`: La categoría no existe o ya fue eliminada

---

### 6. Restaurar Categoría

**Endpoint:** `PATCH /api/v1/categorias/{category_id}/restore`

**Rol requerido:** ADMIN

**Parámetros de ruta:**
- `category_id` (entero): ID de la categoría a restaurar

**Respuesta (200 OK):** Devuelve la categoría restaurada con `deleted_at: null`.

---

## Generación de Slug

Al crear o actualizar una categoría, la API genera automáticamente un slug amigable para URLs:
- Convierte a minúsculas
- Reemplaza espacios por guiones
- Elimina caracteres especiales
- Garantiza unicidad añadiendo sufijo numérico si es necesario (ej. `"frutas-1"`, `"frutas-2"`)

**Ejemplo:** `"Frutas Orgánicas & Frescas"` → `"frutas-organicas--frescas"`

---

## Patrón Soft Delete

Todas las categorías usan eliminación lógica:
- Las categorías eliminadas **nunca se borran físicamente** de la base de datos
- El campo `deleted_at` se establece con el timestamp de eliminación
- Las categorías eliminadas se excluyen de consultas públicas por defecto
- Los administradores pueden ver categorías eliminadas con `include_deleted=true`

---

## Relación con Productos

Las categorías tienen una relación **many-to-many** con Productos, implementada mediante la tabla intermedia `ProductCategory`:
- Un producto puede pertenecer a **múltiples** categorías
- Una categoría puede contener **múltiples** productos
- Eliminar una categoría que tiene productos activos retorna `400 Bad Request`
- Para desasociar un producto de todas sus categorías, actualizar el producto con `category_ids: []`

---

## Control de Acceso

| Operación | Rol requerido | Notas |
|-----------|---------------|-------|
| Crear categoría | ADMIN | Solo admins pueden crear |
| Listar categorías | Cualquiera | Sin ADMIN: solo activas; con ADMIN: puede filtrar con `include_deleted` |
| Obtener por ID | Cualquiera | Acceso público de lectura; eliminadas no se retornan |
| Actualizar categoría | ADMIN | Solo admins pueden modificar |
| Eliminar categoría | ADMIN | Soft delete; valida que no tenga productos activos |
| Restaurar categoría | ADMIN | Solo admins pueden restaurar |

---

## Manejo de Errores

Todas las respuestas de error siguen el formato RFC 7807:

```json
{
  "detail": "Mensaje describiendo el error"
}
```

**Códigos HTTP comunes:**
- `201 Created`: Categoría creada exitosamente
- `200 OK`: Solicitud exitosa
- `204 No Content`: Eliminación exitosa (sin cuerpo de respuesta)
- `400 Bad Request`: Datos inválidos o violación de regla de negocio
- `403 Forbidden`: Permisos insuficientes
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error interno del servidor

---

## Ejemplos (curl)

### Crear categoría

```bash
curl -X POST http://localhost:8000/api/v1/categorias \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Frutas", "description": "Frutas frescas"}'
```

### Listar categorías paginadas

```bash
curl -X GET "http://localhost:8000/api/v1/categorias?skip=0&limit=10" \
  -H "Authorization: Bearer TU_TOKEN"
```

### Obtener categoría por ID

```bash
curl -X GET http://localhost:8000/api/v1/categorias/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

### Actualizar categoría

```bash
curl -X PUT http://localhost:8000/api/v1/categorias/1 \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Frutas Frescas", "description": "Frutas orgánicas"}'
```

### Eliminar categoría

```bash
curl -X DELETE http://localhost:8000/api/v1/categorias/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## OpenAPI / Swagger

El esquema completo de la API está disponible en formato OpenAPI en:
- **JSON:** `GET /openapi.json`
- **Swagger UI:** Visitar `/docs` en el navegador
- **ReDoc:** Visitar `/redoc` en el navegador

La documentación interactiva en Swagger UI permite probar todos los endpoints directamente desde el navegador.
