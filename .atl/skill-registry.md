## Agent Skill Registry

This registry lists all available skills and conventions for the `food-store-robledo` project.

### User Skills

- **branch-pr**: PR creation workflow for Agent Teams Lite following the issue-first enforcement system. Trigger: When creating a pull request, opening a PR, or preparing changes for review.
- **issue-creation**: Issue creation workflow for Agent Teams Lite following the issue-first enforcement system. Trigger: When creating a GitHub issue, reporting a bug, or requesting a feature.
- **judgment-day**: Parallel adversarial review protocol that launches two independent blind judge sub-agents simultaneously to review the same target, synthesizes their findings, applies fixes, and re-judges until both pass or escalates after 2 iterations. Trigger: When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen".
- **skill-creator**: Creates new AI agent skills following the Agent Skills spec. Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI.
- **go-testing**: Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing. Trigger: When writing Go tests, using teatest, or adding test coverage.

### Project Skills

- **code-review-excellence**: Master effective code review practices to provide constructive feedback, catch bugs early, and foster knowledge sharing while maintaining team morale. Use when reviewing pull requests, establishing review standards, or mentoring developers.
- **fastapi-templates**: Create production-ready FastAPI projects with async patterns, dependency injection, and comprehensive error handling. Use when building new FastAPI applications or setting up backend API projects.
- **find-skills**: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
- **git_workflow**: Automatiza el flujo de trabajo de Git (Feature Branch Workflow) para el equipo, garantizando consistencia en cada Change sin requerir comandos manuales por parte del usuario. Trigger: Al iniciar un Change, Al finalizar la implementación del Change, Tras la verificación exitosa del usuario.
- **systematic-debugging**: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **test-driven-development**: Use when implementing any feature or bugfix, before writing implementation code

### Project Conventions

The project follows the rules defined in `AGENTS.md`. Key aspects include:
- **Identity and Role**: Full-Stack Senior developer operating under Spec-Driven Development (SDD).
- **Strict Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Router DOM (Frontend); Python, FastAPI, SQLModel, PostgreSQL, Alembic (Backend).
- **Unbreakable Architectural Rules**: Backend (Feature-First, Router -> Service -> UoW -> Repository -> Model flow, UoW for transactions), Frontend (Feature-Sliced Design), Zustand for client state, TanStack Query for server data, Soft Delete, Snapshot Pattern, Audit Trail, RFC 7807 for HTTP errors.
- **Specification Directory**: Integrador.md (ERD v5, flow diagrams), Historias de Usuario.md (Acceptance Criteria, Business Rules), Descripcion.md (MercadoPago, FSM, Rate Limiting).
- **Git Autopilot**: Utilizes `git_workflow` skill for automated Git operations.
