---
name: engram-memory-workflow
description: >
  Sincroniza memoria persistente del proyecto con Engram.
  Trigger: cuando se inicia un entorno, se completa un change significativo o se cierra una sesión.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Al iniciar un entorno nuevo o luego de clonar/actualizar el repo.
- Al cerrar un bloque de cambios significativo (fix UI, nuevo endpoint, etc.).
- Antes de finalizar la sesión o cerrar un ciclo de trabajo.

## Critical Patterns

1) **Inicialización (Pre-Task)**
- Ejecutar obligatoriamente: `engram sync --import`
- **No comenzar ninguna tarea** sin confirmar éxito.
- Si falla la importación: **DETENERSE** y reportar contexto comprometido.

2) **Mantenimiento (Runtime)**
- Ejecutar `engram sync` (export) **tras cada sub‑tarea o change significativo**.
- Ejemplos: finalizar un fix de UI, cerrar un endpoint, completar una integración.

3) **Finalización (Post-Task)**
- Ejecutar un `engram sync` final y luego `git push`.
- Objetivo: asegurar memoria compartida como fuente de verdad en GitHub.

4) **Conflictos de sincronización**
- Priorizar la versión local recién generada.
- Documentar la discrepancia en el registro de la sesión.

## Commands

```bash
# Pre-Task (import obligatorio)
engram sync --import

# Runtime (export tras sub‑tarea o change)
engram sync

# Post-Task (export final + push)
engram sync
git push
```

## Resources

- **Documentation**: Ver protocolos Engram en AGENTS.md
