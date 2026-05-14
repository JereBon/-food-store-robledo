## ADDED Requirements

### Requirement: Admin puede ver resumen general de métricas del negocio
El sistema SHALL exponer `GET /api/admin/metricas/resumen` que retorna: total de ventas del período, cantidad de pedidos por estado, cantidad de usuarios registrados y top 5 productos más vendidos. Soporta filtro por rango de fechas.

#### Scenario: Resumen sin filtro de fecha
- **WHEN** el Admin solicita el resumen sin parámetros
- **THEN** el sistema retorna métricas de todos los tiempos

#### Scenario: Resumen filtrado por rango de fechas
- **WHEN** el Admin envía `?desde=2025-01-01&hasta=2025-12-31`
- **THEN** el sistema retorna métricas calculadas únicamente para pedidos dentro de ese rango

#### Scenario: Acceso denegado a no-Admin
- **WHEN** un usuario sin rol ADMIN accede al endpoint
- **THEN** el sistema retorna HTTP 403

### Requirement: Admin puede ver evolución de ventas por período
El sistema SHALL exponer `GET /api/admin/metricas/ventas` que retorna una serie temporal de ventas agrupadas por granularidad (dia, semana, mes). Cada punto incluye monto total y cantidad de pedidos.

#### Scenario: Evolución diaria de ventas
- **WHEN** el Admin solicita `?desde=...&hasta=...&granularidad=dia`
- **THEN** el sistema retorna una lista de puntos, uno por día, con monto total y cantidad de pedidos de ese día

#### Scenario: Granularidad inválida
- **WHEN** el Admin envía `?granularidad=hora`
- **THEN** el sistema retorna HTTP 422

### Requirement: Admin puede ver top productos más vendidos
El sistema SHALL exponer `GET /api/admin/metricas/productos-top` que retorna los N productos más vendidos (por cantidad de unidades) en un rango de fechas, calculado sobre pedidos en estado ENTREGADO.

#### Scenario: Ranking de productos en rango de fechas
- **WHEN** el Admin solicita con `?desde=...&hasta=...&limite=10`
- **THEN** el sistema retorna hasta 10 productos ordenados por unidades vendidas (desc), con nombre y total vendido
