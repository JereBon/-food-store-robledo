# Type Checking Guide

This document describes type checking setup and verification for the Food Store project.

## Backend Type Checking (Python + mypy)

### Configuration

**File:** `backend/mypy.ini`

mypy is configured with:
- Python version: 3.11
- Strict checking: `disallow_incomplete_defs = True`
- Type hints required for function parameters and returns
- Unused ignore comments detected
- Redundant casts detected

### Running mypy

```bash
cd backend

# Install (if not already installed)
pip install mypy

# Type check all Python files
mypy app/ tests/

# Type check specific file
mypy app/modules/categorias/service.py

# Watch mode (requires mypy-watch)
mypy-watch app/
```

### Type Hints in Python

#### Function Signatures

All function signatures must include type hints:

```python
# ✅ CORRECT
def create_category(payload: CategoryCreate, repo: CategoryRepository) -> Category:
    """Create a new category."""
    ...

def list_categories(include_deleted: bool = False) -> list[Category]:
    """List categories."""
    ...

# ❌ WRONG - Missing type hints
def create_category(payload, repo):  # mypy will complain
    ...
```

#### Optional Types

Use `Optional[T]` or `T | None` for nullable values:

```python
# ✅ CORRECT - Python 3.10+
def get_category(category_id: int) -> Category | None:
    ...

# ✅ CORRECT - All Python versions
from typing import Optional
def get_category(category_id: int) -> Optional[Category]:
    ...

# ❌ WRONG
def get_category(category_id: int):  # Should return Category | None
    ...
```

#### Database Models

SQLModel entities use type hints for all fields:

```python
# ✅ CORRECT
class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    deleted_at: datetime | None = Field(default=None)

# ❌ WRONG
class Category(SQLModel, table=True):
    id = Field(default=None, primary_key=True)  # Missing type hint
    name = Field(max_length=100)  # Missing type hint
```

#### Pydantic Schemas

```python
# ✅ CORRECT
class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = Field(default=None, max_length=500)

# ❌ WRONG
class CategoryCreate(BaseModel):
    name = Field(...)  # Missing type hint
    description = Field(default=None)  # Missing type hint
```

#### List Types

```python
# ✅ CORRECT - Python 3.9+
def get_all(include_deleted: bool = False) -> list[Category]:
    ...

# ✅ CORRECT - All Python versions
from typing import List
def get_all(include_deleted: bool = False) -> List[Category]:
    ...
```

#### Dictionary Types

```python
# ✅ CORRECT - Python 3.9+
def get_stats() -> dict[str, int]:
    return {"total": 10, "active": 8}

# ✅ CORRECT - All Python versions
from typing import Dict
def get_stats() -> Dict[str, int]:
    ...
```

### Common mypy Errors & Fixes

#### 1. "Function is missing a type annotation for one or more arguments"

```python
# ❌ WRONG
def create(payload):
    pass

# ✅ CORRECT
def create(payload: CategoryCreate) -> Category:
    pass
```

#### 2. "Name is not defined"

```python
# ❌ WRONG
def get() -> Category:
    # Typo in class name
    return Categry()

# ✅ CORRECT
def get() -> Category:
    return Category(...)
```

#### 3. "Incompatible return value type"

```python
# ❌ WRONG
def get_id() -> int:
    return "123"  # String is not int

# ✅ CORRECT
def get_id() -> int:
    return 123
```

#### 4. "Item "X" of "Y" has incompletely defined type"

```python
# ❌ WRONG
class Repository:
    def __init__(self):
        self.session  # Missing type hint
        
# ✅ CORRECT
class Repository:
    def __init__(self, session: Session) -> None:
        self.session: Session = session
```

---

## Frontend Type Checking (TypeScript)

### Configuration

**File:** `frontend/tsconfig.app.json`

TypeScript is configured with:
- Strict mode: `"strict": true`
- No unused locals: `"noUnusedLocals": true`
- No unused parameters: `"noUnusedParameters": true`
- Target: ES2023
- JSX: react-jsx (React 17+)

### Running tsc

```bash
cd frontend

# Type check (no emit)
npx tsc --noEmit

# Check and watch
npx tsc --noEmit --watch

# Full build
npm run build
```

### Type Annotations in TypeScript

#### Function Signatures

All functions must have explicit return types:

```typescript
// ✅ CORRECT
function createCategory(data: ICategoryCreate): Promise<ICategory> {
  return api.post('/categories', data);
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
};

// ❌ WRONG - Missing return type
function createCategory(data) {  // Should return Promise<ICategory>
  return api.post('/categories', data);
}
```

#### React Component Props

```typescript
// ✅ CORRECT
interface CategoryFormProps {
  onSubmit: (data: ICategoryCreate) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const CategoryForm: FC<CategoryFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  // Component JSX
};

// ❌ WRONG - Props not typed
export const CategoryForm = ({ onSubmit, isLoading, error }) => {
  // No TypeScript checking
};
```

#### useState Hook

```typescript
// ✅ CORRECT
const [categories, setCategories] = useState<ICategory[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [selectedId, setSelectedId] = useState<number | null>(null);

// ✅ CORRECT - Type inference (when obvious)
const [count, setCount] = useState(0);  // Inferred as number

// ❌ WRONG - Missing type annotation
const [categories, setCategories] = useState([]);  // unknown type
```

#### useQuery Hook

```typescript
// ✅ CORRECT
const { data, isLoading } = useQuery<ICategory[]>({
  queryKey: ['categories'],
  queryFn: () => api.get('/categories').then(r => r.data),
});

// ❌ WRONG - Missing generic type
const { data, isLoading } = useQuery({
  queryKey: ['categories'],
  queryFn: () => api.get('/categories').then(r => r.data),
});
```

#### Callback Props

```typescript
// ✅ CORRECT
interface ListProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  onSelect: (category: ICategory) => void;
}

// ❌ WRONG - Callback types not explicit
interface ListProps {
  onEdit: any;
  onDelete: Function;
  onSelect: (category) => void;  // Missing param type
}
```

### Common TypeScript Errors & Fixes

#### 1. "Type 'undefined' is not assignable to type 'string'"

```typescript
// ❌ WRONG - description might be undefined
const description: string = category.description;

// ✅ CORRECT - Handle optional
const description: string | undefined = category.description;
// or with default
const description: string = category.description ?? '';
```

#### 2. "Parameter 'x' implicitly has an 'any' type"

```typescript
// ❌ WRONG
const handleClick = (e) => {  // e is any
  console.log(e);
};

// ✅ CORRECT
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e);
};
```

#### 3. "Property does not exist on type"

```typescript
// ❌ WRONG - Typo in interface property
const name: string = category.nam;  // Should be 'name'

// ✅ CORRECT
const name: string = category.name;
```

#### 4. "Argument of type 'string' is not assignable to parameter of type 'number'"

```typescript
// ❌ WRONG - Type mismatch
const id: number = "123";

// ✅ CORRECT
const id: number = parseInt("123", 10);
```

---

## Type Checking in CI/CD

### GitHub Actions

Add type checking to your workflow:

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    
    steps:
      # Python type checking
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install mypy
        run: pip install mypy
      
      - name: Run mypy
        run: cd backend && mypy app/ tests/
      
      # TypeScript type checking
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Type check
        run: cd frontend && npx tsc --noEmit
```

---

## Type Safety Best Practices

1. **Always use strict mode** (both TypeScript and mypy)
2. **Never use `any`** - Use `unknown` if truly unknown, or refine the type
3. **Be explicit with generics** - Don't rely on inference for complex types
4. **Use optional chaining** - `obj?.prop` instead of `obj.prop`
5. **Use nullish coalescing** - `value ?? default` instead of `value || default`
6. **Prefer interfaces over classes** for type definitions (TypeScript)
7. **Use `keyof` to build type-safe object accessors** (TypeScript)

### Type Safety Examples

```typescript
// ❌ WRONG - Using 'any'
const handleData = (data: any) => {
  console.log(data.name);  // No type checking
};

// ✅ CORRECT - Explicit type
const handleData = (data: ICategory) => {
  console.log(data.name);  // Type checked
};

// ❌ WRONG - Type uncertainty
const getValue = () => {
  const value = getSomething();  // Unknown type
  return value.toUpperCase();    // Runtime error possible
};

// ✅ CORRECT - Handle undefined
const getValue = () => {
  const value = getSomething();
  return value?.toUpperCase() ?? 'DEFAULT';
};

// ❌ WRONG - Unsafe object access
const getUserName = (user: unknown) => {
  return user['name'];  // Could be anything
};

// ✅ CORRECT - Type-safe access
const getUserName = (user: IUser) => {
  return user.name;  // Type checked
};
```

---

## Status (as of us-002-categorias)

✅ **Python type hints implemented** on all categorias module files
✅ **TypeScript strict mode enabled** in frontend
✅ **mypy configuration created** (`backend/mypy.ini`)
✅ **tsconfig with strict mode** verified in frontend

**Type checking results**:
- ✅ Backend Python syntax verified (no import/syntax errors)
- ✅ Frontend TypeScript configuration valid with strict mode
- ✅ All entity types properly defined with interfaces/models
- ✅ Router, Service, Repository layers typed

**When dev environment is fully set up**:
1. Run `mypy app/` to verify Python type safety
2. Run `npx tsc --noEmit` to verify TypeScript type safety
3. Fix any reported type errors before committing
