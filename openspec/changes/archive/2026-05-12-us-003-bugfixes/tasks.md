# Tasks — US-003 Bugfixes (Estabilización Post-Integración)

> Estado: **Post-Facto** (todo ya implementado y verificado).

## Backend
- [x] Agregar endpoint `POST /api/v1/auth/login` e integrar verificación de contraseñas.
- [x] Configurar `expire_on_commit=False` en la sesión del UnitOfWork para evitar `DetachedInstanceError`.
- [x] Corregir `AttributeError` en router de categorías: reemplazar `uow.commit()` por `uow.session.commit()`.
- [x] Ajustar `seed.py` para asignar rol `ADMIN` al usuario administrador de pruebas.

## Frontend
- [x] Crear e integrar `LoginForm.tsx` y `RegisterForm.tsx` con TanStack Query + persistencia en Zustand.
- [x] Migrar `features/categories/api.ts` a cliente global Axios (`http`) para inyectar token por interceptor.
- [x] Corregir RBAC en Navbar leyendo roles desde el store (array de roles).
- [x] Actualizar `ProtectedRoute.tsx` para redirigir a `/`.
- [x] Unificar textos del módulo de categorías al español (listados, formularios, modales).

## DevOps / Workflow
- [x] Crear skill `.agents/skills/engram-memory-workflow/SKILL.md` para sincronización de memoria con Engram (import/export/push).
