# SKILL: git_workflow

## Descripción
Automatiza el flujo de trabajo de Git (Feature Branch Workflow) para el equipo, garantizando consistencia en cada Change sin requerir comandos manuales por parte del usuario.

## Comportamiento Automático
Esta skill define el ciclo de vida del versionado. Debes aplicarla de forma proactiva en los siguientes momentos:

1. **Al iniciar un Change:**
   - Sincroniza la rama principal (`git checkout main`, `git pull origin main`).
   - Crea y cambia a la nueva rama usando el formato **change/[numero]-[nombre]** (`git checkout -b change/003-bugfixes`).

2. **Durante el Change:**
   - **Todos los commits** se realizan **exclusivamente** en la rama `change/[numero]-[nombre]`.

3. **Al finalizar la implementación del Change:**
   - DETENTE. No hagas commits a `main` todavía.
   - Pregúntale al usuario: *"Ya terminé de implementar el Change. Por favor, verificá que todo funcione correctamente. Cuando me des el ok, procedo a archivar y commitear a GitHub."*

4. **Tras la verificación exitosa del usuario:**
   - Procede a "archivar" el change según tus conocimientos y configuraciones previas.
   - Haz commit y push de la rama de la feature (`git push origin change/[numero]-[nombre]`).
   - Cambia a la rama main (`git checkout main`), integra los cambios preservando historial (`git merge change/[numero]-[nombre] --no-ff`) y súbelo al repositorio (`git push origin main`).
   - **No borrar** la rama remota: se mantiene como evidencia.
