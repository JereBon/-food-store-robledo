# Food Store

Monorepo del proyecto **Food Store** (React + TypeScript + Vite / FastAPI + SQLModel + PostgreSQL).

## Estructura

- `frontend/`: app web (Vite + React + TS)
- `backend/`: API (FastAPI)
- `openspec/`: workflow OPSX (changes, specs)
- `documentos/`: documentación del proyecto

## Requisitos

- Node.js + npm
- Python 3.13+
- PostgreSQL

## Backend (dev)

1. Copiá variables:

```bash
cp backend/.env.example backend/.env
```

2. (Opcional) Crear venv e instalar deps:

```bash
python -m venv .venv
# activar venv
python -m pip install -r backend/requirements.txt
```

3. Migraciones + seed:

```bash
cd backend
alembic upgrade head
python -m app.db.seed
```

4. Ejecutar API:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

## Backend — Convenciones de capas

Flujo de dependencias (no se invierte):

```
Router → Service → Unit of Work (UoW) → Repository → Model
```

Reglas rápidas:
- **Router** solo HTTP (requests/responses). Llama a `service`.
- **Service** contiene la lógica de negocio. Usa UoW. No hace `commit()` directo.
- **UoW** gestiona transacciones (commit/rollback) y expone repositorios.
- **Repository** solo acceso a datos. Hereda de `BaseRepository[T]`.
- **Model** no conoce services ni routers.

Ejemplo de uso:

```py
with UnitOfWork() as uow:
    result = service.crear_pedido(uow, data, usuario_id)
```

## Frontend (dev)

1. Copiá variables:

```bash
cp frontend/.env.example frontend/.env
```

2. Instalar deps y levantar:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

## OPSX

Lista de changes:

```bash
openspec list
```

Estado de un change:

```bash
openspec status --change "<name>"
```
