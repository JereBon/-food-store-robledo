# Delivery Addresses — Delta Spec

## Capability: `delivery-addresses`

Gestión de direcciones de entrega del cliente. Permite crear, listar, editar y eliminar (soft-delete) direcciones asociadas a un usuario autenticado, con soporte para marcar una como predeterminada.

---

## Data Model

**`DireccionEntrega`** (table: `direccionentrega`)

| Campo | Tipo | Constraints |
|---|---|---|
| id | INTEGER | PK, auto |
| usuario_id | INTEGER | FK `user.id`, NOT NULL, indexed |
| calle | VARCHAR(255) | NOT NULL |
| numero | VARCHAR(20) | nullable |
| piso | VARCHAR(50) | nullable |
| ciudad | VARCHAR(100) | NOT NULL |
| codigo_postal | VARCHAR(20) | nullable |
| es_predeterminada | BOOLEAN | NOT NULL, default False |
| created_at | DATETIME | default utcnow |
| deleted_at | DATETIME | nullable — NULL = activa |

---

## API Endpoints

Base path: `/api/v1/direcciones`  
Auth: JWT Bearer requerido en todos los endpoints.

| Método | Ruta | Status | Response |
|---|---|---|---|
| POST | `/` | 201 | DireccionResponse |
| GET | `/` | 200 | List[DireccionResponse] |
| GET | `/eliminadas` | 200 | List[DireccionResponse] |
| PATCH | `/{id}` | 200 | DireccionResponse |
| DELETE | `/{id}` | 204 | — |
| PATCH | `/{id}/predeterminada` | 200 | DireccionResponse |
| PATCH | `/{id}/reactivar` | 200 | DireccionResponse |

Ownership: las mutaciones (PATCH, DELETE) verifican `usuario_id == current_user.id`; retornan 404 si no pertenece al usuario.

---

## Business Rules

1. **Auto-predeterminada**: la primera dirección activa de un usuario se crea con `es_predeterminada = True`.
2. **Unicidad**: solo una dirección puede ser predeterminada por usuario. `set_default` desactiva la anterior en la misma sesión.
3. **Promoción al eliminar**: si se soft-delete la predeterminada, el servicio promueve la siguiente dirección activa. Sin activas: no hay predeterminada.
4. **Soft-delete**: `deleted_at` NULL = activa. `PATCH /{id}/reactivar` restaura sin modificar `es_predeterminada`.
5. **Aislamiento de usuarios**: ningún endpoint expone ni modifica direcciones de otros usuarios.

---

## Schemas

```python
class DireccionCreate(BaseModel):
    calle: str
    numero: Optional[str] = None
    piso: Optional[str] = None
    ciudad: str
    codigo_postal: Optional[str] = None

class DireccionUpdate(BaseModel):
    calle: Optional[str] = None
    numero: Optional[str] = None
    piso: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None

class DireccionResponse(BaseModel):
    id: int
    usuario_id: int
    calle: str
    numero: Optional[str]
    piso: Optional[str]
    ciudad: str
    codigo_postal: Optional[str]
    es_predeterminada: bool
    created_at: datetime
    deleted_at: Optional[datetime]
```

---

## Frontend Components

**`AddressForm`** (`frontend/src/features/checkout/AddressForm.tsx`)
- Props: `onSave`, `onCancel?`, `loading?`, `initial?: DireccionEntrega`
- Validación: `calle` y `ciudad` obligatorios
- Modo edición: pre-llena campos desde `initial` vía `useEffect`

**`AddressList`** (`frontend/src/features/checkout/AddressList.tsx`)
- Props: `addresses`, `deletedAddresses?`, `selectedId`, `onSelect`, `onEdit`, `onDelete`, `onSetDefault`, `onRestore?`, `showDeleted?`, `onToggleShowDeleted?`
- Radio-group para selección de dirección activa
- Acciones inline: Editar, Marcar predeterminada, Eliminar
- Toggle para mostrar sección de eliminadas con acción Recuperar por ítem

---

## Test Coverage

- `POST /direcciones` → 201, primera dirección es predeterminada
- Segunda dirección → no predeterminada
- `GET /direcciones` → lista activas
- `PATCH /{id}` → actualiza campo
- `DELETE /{id}` → soft-delete, desaparece del listado activo
- `PATCH /{id}/predeterminada` → exactamente una predeterminada
- `PATCH /{id}` con token de otro usuario → 404
- `POST /direcciones` sin token → 401
