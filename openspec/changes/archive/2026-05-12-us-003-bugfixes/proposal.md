# Proposal — US-003 Bugfixes (Estabilización Post-Integración)

## Contexto
Luego de la integración de Auth + Categorías se detectaron fallas críticas que impedían el funcionamiento del sistema (frontend en blanco, fallas de autenticación y errores de runtime en backend). Antes de continuar con nuevas features, se requiere una fase de estabilización para asegurar la base técnica y la consistencia de UX.

## Objetivo
Documentar y consolidar las correcciones críticas ya implementadas en backend y frontend, dejando registrada la estabilización como Change formal del proyecto.

## Alcance
- Correcciones críticas en backend (Auth, UoW, Categorías, seed).
- Correcciones críticas en frontend (Auth UI, RBAC, rutas protegidas, Axios, i18n del módulo de categorías).

## Fuera de Alcance
- Nuevas funcionalidades o cambios de alcance funcional.
- Refactors no relacionados a la estabilidad actual.

## Resultado Esperado
- Sistema estable con Auth y Categorías funcionando end-to-end.
- UX consistente en español para el módulo de categorías.
- Registro formal de la estabilización en el historial del proyecto.
