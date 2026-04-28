## Context

Actualmente el proyecto existe como workspace inicial con documentación y carpeta `openspec/`, pero sin código ejecutable ni estructura de proyecto para backend/frontend. El Sprint 0 (us-000-setup) crea la infraestructura mínima para que el resto de los changes se puedan implementar de forma consistente y con bajo costo de coordinación.

Restricciones y lineamientos:
- Backend: FastAPI + SQLModel + Alembic + PostgreSQL.
- Frontend: React + TypeScript + Vite.
- Arquitectura: backend en capas (Router → Service → UoW → Repository → Model) y organización feature-first; frontend con Feature-Sliced Design (FSD).
- Cross-cutting: CORS por env, rate limiting con slowapi en endpoints sensibles.

## Goals / Non-Goals

**Goals:**
- Dejar creado un monorepo con `backend/` y `frontend/` y convenciones claras.
- Backend: scaffold feature-first por módulos y “core” compartido; bootstrap FastAPI (config/env, CORS, routers, rate limiting listo).
- Backend: implementar `BaseRepository[T]` y `Unit of Work (UoW)` como base de persistencia/transacciones.
- Base de datos: Alembic funcionando y seed idempotente con datos mínimos obligatorios.
- Frontend: scaffold FSD + 4 stores Zustand tipados (auth/cart/payment/ui) y cliente HTTP base.

**Non-Goals:**
- Implementar features de negocio (auth real, catálogo, pedidos, pagos, etc.).
- Completar UI/UX o pantallas; solo base de estructura y wiring.
- Definir métricas/dashboard o integraciones externas completas (MercadoPago queda para su change).

## Decisions

1) Monorepo con separación `backend/` y `frontend/`
- **Decisión**: mantener dos proyectos separados en carpetas hermanas.
- **Rationale**: reduce acoplamiento de tooling y permite dependencias y scripts específicos.
- **Alternativas**: repos separados (más fricción para el curso/equipo); mono-package (mezcla toolchains).

2) Backend feature-first + capas internas
- **Decisión**: módulos verticales por dominio (`app/modules/<modulo>/...`) y capas Router/Service/UoW/Repository/Model dentro de cada módulo, con un `app/core/` para cross-cutting (config, db, security, errors).
- **Rationale**: localiza cambios por feature y preserva testabilidad con dependencias unidireccionales.
- **Alternativas**: estructura por tipo (routers/, services/, models/) (tiende a dispersar cambios).

3) Persistencia y transacciones con UoW + BaseRepository[T]
- **Decisión**: `BaseRepository[T]` genérico para CRUD común y `UnitOfWork` como context manager (commit/rollback centralizado).
- **Rationale**: evita commits “sueltos” desde services y facilita atomicidad y tests.
- **Alternativas**: manejar sesiones manualmente en services (más errores y acoplamiento).

4) Migraciones con Alembic + seed idempotente
- **Decisión**: Alembic como fuente de verdad de DDL versionado y seed script repetible.
- **Rationale**: consistencia entre entornos y onboarding simple del equipo.
- **Alternativas**: crear tablas “a mano” (inconsistente), o seeds no idempotentes (duplicados).

5) Frontend con FSD + Zustand para estado cliente
- **Decisión**: carpetas `app/pages/widgets/features/entities/shared` y stores Zustand separados (auth/cart/payment/ui).
- **Rationale**: límites de import claros, escalabilidad y separación entre estado cliente (Zustand) y estado servidor (TanStack Query) para próximos sprints.
- **Alternativas**: estructura “por rutas” sin capas (se degrada con el tiempo), Redux (más boilerplate para este alcance).

## Risks / Trade-offs

- [Riesgo] El scaffold puede “derivar” sin enforcement (imports cruzados, capas violadas) → **Mitigación**: documentar convenciones + linters/reglas en un change posterior si hace falta.
- [Riesgo] Seeds con IDs no estables rompen RBAC/FSM → **Mitigación**: IDs explícitos y tests simples (smoke) en el futuro.
- [Trade-off] Crear estructura completa de módulos desde el día 0 agrega ruido inicial → **Mitigación**: placeholders mínimos; se completan en cambios siguientes.

## Migration Plan

- No aplica migración desde un sistema previo: es bootstrap inicial.
- Estrategia de rollback: revertir el commit del change en Git (no hay datos productivos).

## Open Questions

- Convenciones exactas de naming/paths (por ejemplo `app/` vs `src/` en frontend) y tooling (ruff/black/eslint) si el curso lo exige.
- Preferencia final por `PyJWT` vs `python-jose` (para auth; puede quedar decidido en `us-001-auth`).
