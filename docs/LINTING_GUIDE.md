# Linting & Code Quality Setup

This document describes the code quality tools and configurations for the Food Store project.

## Backend (Python)

### Ruff Configuration

**File:** `backend/pyproject.toml`

Ruff is configured with the following rules:
- Line length: 100 characters
- Python version: 3.11+
- Enabled rules:
  - `E`: pycodestyle errors
  - `W`: pycodestyle warnings  
  - `F`: pyflakes (undefined names, duplicate imports)
  - `I`: isort (import sorting)
  - `B`: flake8-bugbear (common bugs)
  - `C4`: flake8-comprehensions
  - `UP`: pyupgrade

### Running Ruff

```bash
cd backend

# Install (if not already installed)
pip install ruff black isort

# Check only
ruff check app/ tests/

# Fix automatically
ruff check app/ tests/ --fix

# Format with Black
black app/ tests/

# Sort imports
isort app/ tests/
```

### Import Order Rules

Imports are organized by isort in the following order:
1. Standard library imports
2. Third-party imports
3. Local application imports
4. Blank line between each group

```python
# ✅ CORRECT
import os
from typing import Optional

from sqlmodel import Session, select
from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.modules.categorias.repository import CategoryRepository
```

### Code Style

- Max line length: 100 characters
- 2 blank lines between top-level definitions
- 1 blank line between methods in a class
- No unused imports or variables
- Type hints on all function signatures

### Common Issues to Fix

1. **Unused imports**: Remove or use `_` prefix for intentional ignores
2. **Long lines**: Break into multiple lines or reduce line length
3. **Import order**: Ruff's `--fix` will auto-fix import order
4. **Undefined names**: Fix typos or add imports

## Frontend (TypeScript)

### ESLint Configuration

**File:** `frontend/eslint.config.js`

ESLint is configured with:
- TypeScript support via `@typescript-eslint`
- React plugin for React-specific rules
- React Hooks plugin for hook rules
- Strict TypeScript checking

### Running ESLint

```bash
cd frontend

# Install (if not already installed)
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks

# Check only
npm run lint

# Fix automatically
npm run lint -- --fix
```

### TypeScript Type Checking

```bash
cd frontend

# Install TypeScript (if not already installed)
npm install typescript

# Type check without emitting
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### ESLint Rules

**TypeScript**:
- Prefer explicit return types on functions (warn)
- Disallow `any` type (warn)
- Report unused variables (warn, unless prefixed with `_`)

**React**:
- `react-in-jsx-scope`: Off (React 17+ doesn't require React import)
- `prop-types`: Off (Using TypeScript instead)
- `react-hooks/rules-of-hooks`: Error (Hooks must be called correctly)
- `react-hooks/exhaustive-deps`: Warn (useEffect dependencies)

**General**:
- Disallow `console.log` (warn, allow `console.warn` and `console.error`)
- Prefer `const` over `let` (warn)
- Disallow `var` (error)

### Common Issues to Fix

1. **Unused variables**: Remove or prefix with `_`
2. **Missing return types**: Add explicit return type annotations
3. **Hook dependency arrays**: Ensure all dependencies are listed
4. **Any types**: Replace with proper types or use `unknown` if needed
5. **Console statements**: Remove or change to `console.warn`/`console.error`

## Pre-Commit Hooks (Optional)

Create `.husky/pre-commit` to run linters before commits:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Backend
cd backend && ruff check app/ && black --check app/ && cd ..

# Frontend  
cd frontend && npm run lint && npm run type-check && cd ..

# If we get here, all checks passed
```

Install husky:
```bash
npx husky-init
npx husky add .husky/pre-commit "cd backend && ruff check app/ --fix && black app/ && cd .. && cd frontend && npm run lint -- --fix && cd .."
```

## CI/CD Integration

For GitHub Actions, add to `.github/workflows/lint.yml`:

```yaml
name: Lint & Type Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # Backend linting
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install ruff black isort
      
      - name: Run ruff
        run: cd backend && ruff check app/ tests/
      
      - name: Run black
        run: cd backend && black --check app/ tests/
      
      # Frontend linting
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run ESLint
        run: cd frontend && npm run lint
      
      - name: Type check
        run: cd frontend && npx tsc --noEmit
```

## IDE Integration

### VS Code

Install extensions:
- **Backend**: Ruff, Black Formatter
- **Frontend**: ESLint, Prettier - Code formatter (optional)

Configure `settings.json`:

```json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": "explicit"
    }
  },
  "[typescript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
}
```

## Best Practices

1. **Always run linters before committing**
2. **Fix issues as you code** (enable IDE integration)
3. **Don't disable rules** - ask the team first
4. **Keep line length reasonable** (100 chars for Python, 120 for TypeScript)
5. **Use type hints everywhere** (TypeScript and Python)
6. **Review linter suggestions** - they often catch real bugs

## Troubleshooting

### Python

**Issue**: `line too long` but can't break it  
**Solution**: Use parentheses for implicit line continuation

```python
# ❌ WRONG
result = function_name(arg1, arg2, arg3, arg4, arg5, arg6, arg7)

# ✅ CORRECT
result = function_name(
    arg1, arg2, arg3, arg4, 
    arg5, arg6, arg7
)
```

**Issue**: `imported but unused`  
**Solution**: Use `_` prefix if intentional

```python
# ✅ CORRECT
from typing import Optional  # Used
from typing import _List    # Intentional ignore

# ❌ WRONG
from typing import List     # Never used
```

### TypeScript

**Issue**: `any` type in callback  
**Solution**: Add proper type annotation

```typescript
// ❌ WRONG
.then(data => { /* ... */ })

// ✅ CORRECT
.then((data: ICategory[]) => { /* ... */ })
```

**Issue**: Missing dependency in useEffect  
**Solution**: Add all dependencies

```typescript
// ❌ WRONG
useEffect(() => {
  console.log(categoryId);
}, []) // Missing categoryId

// ✅ CORRECT
useEffect(() => {
  console.log(categoryId);
}, [categoryId])
```

---

## Status (as of us-002-categorias completion)

✅ **All code syntax-checked**
✅ **Ruff configuration created** (`backend/pyproject.toml`)
✅ **ESLint configuration created** (`frontend/eslint.config.js`)
✅ **TypeScript strict mode enabled** (from project setup)

**Next steps when development environment is set up**:
1. Run `ruff check app/ --fix` to auto-fix Python issues
2. Run `npm run lint -- --fix` to auto-fix TypeScript issues
3. Run `npx tsc --noEmit` for full type checking
4. Commit the results
