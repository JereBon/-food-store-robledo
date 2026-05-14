## Mapeo de Cambios (Changes Mapping)

| Change / Rama | Épica (Sprint) | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **us-000-setup** | EPIC 00 (Sprint 0) | [cite_start]Infraestructura monorepo, backend FastAPI, PostgreSQL+Alembic, frontend Vite y patrones base. [cite: 2071, 2072] | ✅ Completado |
| **us-001-auth** | EPIC 01 & 02 (Sprint 1) | [cite_start]Autenticación JWT, RBAC (4 roles), rotación de refresh tokens y navegación protegida. [cite: 2073, 2074] | ✅ Completado |
| **us-002-categorias**| EPIC 03 & 04 (Sprint 2) | [cite_start]Gestión jerárquica de categorías (CTE) e ingredientes con alérgenos. [cite: 2075, 2076] | ✅ Completado |
| **us-003-bugfixes** | EPIC 03 & 04 (Sprint 2) | Estabilización post-integración (Auth + Categorías), correcciones críticas backend/frontend y normalización de UX. | ✅ Completado |
| **us-004-productos** | EPIC 05 & 06 (Sprint 3) | [cite_start]CRUD de productos, stock, asociación de categorías y gestión del perfil de cliente. [cite: 2077, 2078, 2079] | ✅ Completado |
| **us-005-carrito** | EPIC 08 (Sprint 4) | [cite_start]Carrito persistente client-side con Zustand y personalización de ingredientes. [cite: 2080, 2081] | ✅ Completado |
| **us-006-pedidos** | EPIC 09 & 10 (Sprint 5) | [cite_start]Validación de disponibilidad y creación atómica de pedidos con Snapshots (UoW). [cite: 2082, 2083] | ✅ Completado |
| **us-009-direcciones**| EPIC 07 (Sprint 4) | [cite_start]CRUD de direcciones de entrega, selección de dirección predeterminada, soft-delete con recuperación. | ✅ Completado (incluido en US-006) |
| **us-007-pagos-mp** | EPIC 11 & 12 (Sprint 6) | [cite_start]Integración MercadoPago, webhooks IPN y Máquina de Estados (FSM) del pedido. [cite: 2084, 2085, 2086] | 📝 Pendiente |
| **us-008-admin** | EPIC 15, 16, 17 (Sprint 8)| [cite_start]Panel de administración, métricas con recharts y gestión de usuarios. [cite: 2090, 2091, 2092] | 📝 Pendiente |