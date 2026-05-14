## Architecture

El módulo sigue el patrón Feature-First del backend y Feature-Sliced Design del frontend, coherente con todos los changes anteriores del proyecto.

### Backend — Feature-First

```
backend/app/modules/direcciones/
├── model.py        # DireccionEntrega (SQLModel, table=True)
├── schemas.py      # DireccionCreate, DireccionUpdate, DireccionResponse
├── repository.py   # DireccionRepository(BaseRepository)
├── service.py      # DireccionService — lógica de negocio
└── router.py       # FastAPI router, prefix="/direcciones"
```

**Model: `DireccionEntrega`**

| Campo | Tipo | Notas |
|---|---|---|
| id | int (PK) | auto |
| usuario_id | int (FK user.id) | indexed |
| calle | str(255) | required |
| numero | str(20) | optional |
| piso | str(50) | optional |
| ciudad | str(100) | required |
| codigo_postal | str(20) | optional |
| es_predeterminada | bool | default False |
| created_at | datetime | default utcnow |
| deleted_at | datetime | null = activa |

**Endpoints REST**

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/direcciones` | Crear dirección |
| GET | `/api/v1/direcciones` | Listar activas (query param `incluir_eliminadas`) |
| GET | `/api/v1/direcciones/eliminadas` | Listar solo eliminadas |
| PATCH | `/api/v1/direcciones/{id}` | Actualizar campos |
| DELETE | `/api/v1/direcciones/{id}` | Soft-delete |
| PATCH | `/api/v1/direcciones/{id}/predeterminada` | Marcar como predeterminada |
| PATCH | `/api/v1/direcciones/{id}/reactivar` | Restaurar eliminada |

Todos los endpoints requieren JWT válido (`get_current_user`). Las mutaciones verifican ownership (usuario_id == current_user.id) y retornan 404 si no pertenece al usuario.

### Business Rules

1. **Auto-predeterminada**: al crear la primera dirección activa del usuario, `es_predeterminada = True` automáticamente.
2. **Solo una predeterminada**: al llamar `PATCH /{id}/predeterminada`, se desactiva la anterior y se activa la nueva en la misma transacción.
3. **Promoción al eliminar**: si se elimina (soft-delete) la dirección predeterminada, el servicio promueve la siguiente dirección activa del usuario. Si no hay ninguna, no hay predeterminada.
4. **Soft-delete con recuperación**: `deleted_at` NULL = activa, `deleted_at` timestamp = eliminada. `PATCH /{id}/reactivar` la restaura.

### Unit of Work

Todas las operaciones usan el patrón UoW del proyecto:

```python
with UnitOfWork() as uow:
    service = DireccionService(DireccionRepository(uow.session))
    result = service.create(user.id, payload)
    uow.session.flush()
    uow.session.refresh(result)
    return DireccionResponse.model_validate(result)
```

### Frontend — Feature-Sliced Design

Los componentes viven bajo `frontend/src/features/checkout/` porque las direcciones se consumen exclusivamente en el flujo de checkout. No existe una página independiente de gestión de direcciones — se gestionan inline durante el checkout.

**`AddressList`** — componente presentacional puro:
- Renderiza lista de direcciones activas como radio-group
- Acciones inline por ítem: Editar, Marcar predeterminada (si no lo es), Eliminar
- Toggle para mostrar/ocultar sección de eliminadas
- Sección de eliminadas con botón "Recuperar" por ítem

**`AddressForm`** — formulario crear/editar:
- Campos: Calle (required), Número, Piso/Depto, Ciudad (required), Código Postal
- Validación client-side: calle y ciudad obligatorios
- Modo edición: recibe `initial?: DireccionEntrega` y pre-llena el formulario vía `useEffect`

**Tipos en `api.ts`** (checkout feature):
```typescript
interface DireccionEntrega {
  id: number
  usuario_id: number
  calle: string
  numero?: string
  piso?: string
  ciudad: string
  codigo_postal?: string
  es_predeterminada: boolean
  created_at: string
  deleted_at?: string
}

interface DireccionCreate {
  calle: string
  numero?: string
  piso?: string
  ciudad: string
  codigo_postal?: string
}
```

### Database Migration

La tabla `direccionentrega` se creó en la migración `0006_pedidos` (junto a las tablas de pedidos) porque ambas features se implementaron en el mismo sprint. No existe una migración separada para direcciones.

## Testing Strategy

Tests de integración con `TestClient` de FastAPI y SQLite in-memory. Cubren:
- Crear dirección → 201 + auto-predeterminada
- Segunda dirección → no predeterminada
- Listar, actualizar, eliminar (soft-delete)
- Set predeterminada → exactamente una predeterminada
- Ownership → 404 para otros usuarios
- Auth requerida → 401 sin token
