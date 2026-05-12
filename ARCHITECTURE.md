# Architecture Documentation

## System Overview

Food Store is a full-stack e-commerce platform built with Spec-Driven Development (SDD) methodology. The system follows a **Feature-First Backend** architecture and **Feature-Sliced Design** for the frontend.

---

## Backend Architecture

### Principles

1. **Feature-First Organization**: Each feature is vertically organized in its own module
2. **Dependency Flow**: `Router` → `Service` → `Unit of Work` → `Repository` → `Model`
3. **Transaction Management**: UnitOfWork pattern handles all database transactions
4. **Separation of Concerns**: Each layer has a single responsibility

### Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── security.py          # JWT, password hashing, role definitions
│   │   ├── deps.py              # Dependency injection (auth, roles)
│   │   └── database.py          # Database connection
│   │
│   ├── db/
│   │   ├── models.py            # SQLModel entities (User, Category, Product, etc.)
│   │   └── seed.py              # Database seeding with initial data
│   │
│   ├── modules/                 # Feature-First modules
│   │   ├── categorias/          # Category Management (NEW)
│   │   │   ├── model.py         # SQLModel entity
│   │   │   ├── schemas.py       # Pydantic request/response schemas
│   │   │   ├── repository.py    # Database operations
│   │   │   ├── service.py       # Business logic
│   │   │   └── router.py        # FastAPI endpoints
│   │   │
│   │   ├── productos/           # Product Management
│   │   │   ├── model.py
│   │   │   ├── schemas.py
│   │   │   ├── repository.py
│   │   │   ├── service.py
│   │   │   └── router.py
│   │   │
│   │   ├── auth/                # Authentication
│   │   ├── users/               # User Management
│   │   ├── carrito/             # Shopping Cart
│   │   ├── pedidos/             # Orders
│   │   ├── pagos/               # Payments
│   │   └── router.py            # Main router - includes all module routers
│   │
│   ├── uow.py                   # Unit of Work (transaction manager)
│   └── main.py                  # FastAPI app initialization
│
├── tests/
│   └── modules/
│       └── categorias/          # Feature-specific tests
│           ├── test_router.py   # Endpoint tests
│           ├── test_service.py  # Business logic tests
│           └── test_repository.py
│
├── alembic/                     # Database migrations
│   └── versions/
│       ├── 0001_initial.py
│       ├── 0002_users.py
│       ├── 0003_create_categories.py    # NEW
│       └── 0004_create_products.py      # NEW (products with category_id FK)
│
├── .env                         # Environment configuration
├── requirements.txt             # Python dependencies
└── main.py                      # Entry point
```

### Layer Details

#### 1. Router Layer (`router.py`)

- **Responsibility**: HTTP endpoint handling, authentication/authorization
- **Input**: HTTP requests
- **Output**: JSON responses
- **Cannot**: Contain business logic, database queries, or transaction handling
- **Must**: Depend on Service layer

```python
@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    user: User = Depends(require_role(["ADMIN"])),
    session: Session = Depends(get_session),
):
    """Router delegates to Service → UoW → Repository"""
    with UnitOfWork() as uow:
        repo = CategoryRepository(uow.session)
        service = CategoryService(repo)
        category = service.create(payload)
        uow.commit()  # Transaction handled by UoW
        return category
```

#### 2. Service Layer (`service.py`)

- **Responsibility**: Business logic and orchestration
- **Input**: Domain objects and DTOs
- **Output**: Domain objects
- **Cannot**: Commit/rollback transactions (UoW does this), make HTTP calls
- **Must**: Depend on Repository layer

```python
class CategoryService:
    def __init__(self, repo: CategoryRepository):
        self.repo = repo
    
    def create(self, payload: CategoryCreate) -> Category:
        # Business logic: validate unique name, generate slug
        if self.repo.get_by_name(payload.name):
            raise ValueError(f"Category '{payload.name}' already exists")
        
        slug = self.generate_slug(payload.name)
        category = Category(name=payload.name, slug=slug, ...)
        return self.repo.create(category)
    
    def generate_slug(self, name: str) -> str:
        # Slug generation logic with conflict handling
        base_slug = name.lower().replace(" ", "-")
        ...
        return slug
```

#### 3. Unit of Work (`uow.py`)

- **Responsibility**: Transaction management
- **Input**: Operations via Repository
- **Output**: Database state changes
- **Cannot**: Contain business logic
- **Must**: Provide `commit()` and `rollback()` semantics

```python
class UnitOfWork:
    def __enter__(self):
        self.session = SessionLocal()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        self.session.close()
    
    def commit(self):
        self.session.commit()
    
    def rollback(self):
        self.session.rollback()
```

#### 4. Repository Layer (`repository.py`)

- **Responsibility**: Data access layer
- **Input**: Database queries via SQLModel
- **Output**: Domain objects
- **Cannot**: Contain business logic or commit transactions
- **Must**: Depend only on Models

```python
class CategoryRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, category: Category) -> Category:
        self.session.add(category)
        return category
    
    def get_by_id(self, id: int, include_deleted: bool = False) -> Category:
        query = select(Category).where(Category.id == id)
        if not include_deleted:
            query = query.where(Category.deleted_at == None)
        return self.session.exec(query).first()
```

#### 5. Model Layer (`model.py`)

- **Responsibility**: Database schema definition
- **Input**: None (static)
- **Output**: SQLModel entity classes
- **Cannot**: Contain business logic or repository methods
- **Defines**: Table structure, relationships, constraints

```python
class Category(SQLModel, table=True):
    __tablename__ = "category"
    
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100, unique=True)
    slug: str = Field(index=True, unique=True, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = Field(default=None, index=True)
```

### Dependency Flow Diagram

```
HTTP Request
    ↓
[Router] ←→ {require_role, get_current_user}
    ↓ (delegates)
[Service] (orchestrates business logic)
    ↓ (uses)
[UnitOfWork] (manages transaction)
    ↓ (contains)
[Repository] (data access)
    ↓ (queries)
[Model] (SQLModel entity)
    ↓
Database
```

**Important**: Never skip layers. Never call Repository from Router. Never call Database directly from Service.

### Error Handling

All errors follow **RFC 7807 Problem Details** format:

```python
# HTTP 400 - Bad Request
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="A category with name 'Fruits' already exists"
)

# HTTP 403 - Forbidden (non-admin)
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Admin access required"
)

# HTTP 404 - Not Found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Category not found"
)
```

### Soft Delete Pattern

All deletable entities implement soft delete:
- `deleted_at` timestamp field
- Deleted records never removed from database
- Public queries exclude deleted records by default
- Admin queries can include deleted records with `include_deleted=true`

```python
class CategoryRepository:
    def delete_soft(self, entity: Category) -> None:
        entity.deleted_at = datetime.utcnow()
        entity.updated_at = datetime.utcnow()
        self.session.add(entity)
```

---

## Frontend Architecture

### Principles

1. **Feature-Sliced Design**: Organized by features, not by technology
2. **Clear Layer Boundaries**: `pages` → `features` → `widgets` → `entities` → `shared`
3. **Single Source of Truth**: TanStack Query for server data, Zustand for UI state
4. **Type Safety**: 100% TypeScript with strict mode

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── router/              # Route definitions
│   │   │   └── AppRouter.tsx    # All routes with role-based protection
│   │   ├── providers/           # React Context/Query providers
│   │   │   └── AppProviders.tsx # QueryClient, Zustand store
│   │   └── App.tsx              # Root component with Navigation
│   │
│   ├── pages/                   # Page components (full screens)
│   │   ├── HomePage.tsx
│   │   ├── CategoriesPage.tsx   # Categories management page (ADMIN)
│   │   └── ProductsPage.tsx
│   │
│   ├── features/                # Feature modules (vertical slices)
│   │   ├── categories/          # Category Management feature
│   │   │   ├── api.ts           # TanStack Query hooks
│   │   │   │   └── useCategories, useCreateCategory, etc.
│   │   │   ├── widgets/         # Feature-specific components
│   │   │   │   ├── CategoryList.tsx
│   │   │   │   ├── CategoryForm.tsx
│   │   │   │   └── CategorySelect.tsx
│   │   │   ├── pages/           # Feature pages
│   │   │   │   └── CategoriesPage.tsx
│   │   │   └── types.ts         # Feature-specific types
│   │   │
│   │   ├── products/            # Product Management feature
│   │   │   ├── api.ts
│   │   │   ├── widgets/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   └── CategorySelect.tsx (reused from categories)
│   │   │   └── pages/
│   │   │
│   │   ├── auth/                # Authentication feature
│   │   ├── carrito/             # Shopping Cart feature
│   │   ├── pedidos/             # Orders feature
│   │   └── pagos/               # Payments feature
│   │
│   ├── entities/                # Shared domain models (TypeScript interfaces)
│   │   ├── user.ts              # IUser, ILoginRequest, etc.
│   │   ├── category.ts          # ICategory, ICategoryCreate (NEW)
│   │   ├── product.ts           # IProduct, IProductCreate
│   │   ├── carrito.ts           # ICartItem
│   │   └── pedidos.ts           # IPedido, ILineItem
│   │
│   ├── shared/                  # Reusable across features
│   │   ├── components/
│   │   │   ├── Navigation.tsx   # Sidebar/navbar (admin-only links)
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # Auth context
│   │   │   ├── useCart.ts       # Zustand cart store
│   │   │   └── useApi.ts        # API error handling
│   │   │
│   │   ├── routing/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   │
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   │
│   │   └── utils/
│   │       ├── api.ts           # Axios instance
│   │       ├── format.ts        # Formatters
│   │       └── validate.ts      # Validators
│   │
│   ├── __tests__/
│   │   └── features/
│   │       ├── categories/
│   │       │   ├── CategorySelect.test.tsx
│   │       │   ├── CategoryForm.test.tsx
│   │       │   ├── CategoriesPage.test.tsx
│   │       │   └── ErrorHandling.test.tsx
│   │       └── products/
│   │           └── ProductForm.test.tsx
│   │
│   ├── index.css
│   └── main.tsx
│
├── tsconfig.json                # TypeScript strict mode
├── vitest.config.ts             # Test configuration
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

### Layer Details

#### 1. Pages (`pages/`)

- Full-screen components
- Orchestrate multiple features
- Connect to routing
- Examples: `CategoriesPage`, `ProductsPage`

```typescript
export const CategoriesPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <h1>Categories Management</h1>
      <CategoryList onEdit={...} onDelete={...} />
      {isModalOpen && <CategoryForm onSubmit={handleCreate} />}
    </div>
  );
};
```

#### 2. Features (`features/*/`)

- Vertical slice of a feature
- Contains: `api.ts`, `widgets/`, `pages/`
- `api.ts`: TanStack Query hooks for server data
- `widgets/`: Feature-specific components
- `pages/`: Feature entry point (full page)

```typescript
// features/categories/api.ts - TanStack Query hooks (SERVER data only)
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: ICategoryCreate) => 
      api.post('/categories', data).then(r => r.data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// features/categories/widgets/CategoryForm.tsx - Component
export const CategoryForm: FC<Props> = ({ onSubmit }) => {
  // Component logic here
  // NO QueryClient, NO useQuery, NO useCreateCategory
  // Just props and state
};
```

#### 3. Entities (`entities/`)

- TypeScript interfaces for domain models
- No logic, only types
- Shared across features
- Examples: `ICategory`, `IProduct`, `IUser`

```typescript
// entities/category.ts
export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ICategoryCreate {
  name: string;
  description?: string;
}

export interface ICategoryUpdate {
  name?: string;
  description?: string;
}
```

#### 4. Shared (`shared/`)

- Components used across features
- Hooks for common logic
- Utilities and helpers
- Examples: `Navigation`, `ProtectedRoute`, `Button`

### State Management Rules

**TanStack Query (Server Data - ONLY)**:
```typescript
// ✅ CORRECT - Fetch from API
const { data: categories } = useCategories();

// ✅ CORRECT - Mutate server state
const { mutate: createCategory } = useCreateCategory();
```

**Zustand (UI State - ONLY)**:
```typescript
// ✅ CORRECT - UI state only
const cartStore = create((set) => ({
  items: [],
  addItem: (item) => set(state => ({...})),
  removeItem: (id) => set(state => ({...})),
}));

// ❌ WRONG - Never put server data in Zustand
// const categories = useStore(state => state.categories); // NO!
```

### Type Safety

- 100% TypeScript strict mode
- No `any` types
- All responses typed with interfaces from `entities/`
- React component props fully typed with `FC<Props>`

---

## Database Schema

### Core Tables

#### categories (NEW)
```sql
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  INDEX (deleted_at)
);
```

#### products (NEW - with category support)
```sql
CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT NULLABLE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (category_id) REFERENCES category(id),
  INDEX (category_id),
  INDEX (deleted_at)
);
```

### Relationship: One Category → Many Products

- Category has zero or more Products
- Product belongs to at most one Category (nullable)
- Deletion cascade: Prevent delete if products exist (business rule)

---

## Testing Strategy

### Backend Tests

- **Unit Tests**: Service layer business logic
- **Integration Tests**: Router + Service + Repository
- **Database Tests**: Soft delete, slug generation, constraints
- **Error Handling Tests**: 403, 400, 404 responses

```python
# pytest - test both success and error paths
def test_create_category_success():
    # Setup
    # Execute
    # Assert

def test_create_category_duplicate_name_error():
    # Verify 400 Bad Request
    
def test_create_category_forbidden_non_admin():
    # Verify 403 Forbidden
```

### Frontend Tests

- **Unit Tests**: Components in isolation
- **Integration Tests**: Feature workflows (create → edit → delete)
- **Error Handling Tests**: API errors, user feedback
- **Accessibility Tests**: ARIA labels, keyboard navigation

```typescript
// vitest + @testing-library/react
describe('CategoryForm', () => {
  it('renders form fields', () => { /* ... */ });
  it('validates required fields', () => { /* ... */ });
  it('submits form data', () => { /* ... */ });
  it('displays error messages', () => { /* ... */ });
});
```

---

## Git Workflow

### Commit Message Format

```
feat(modulo): descripción breve del cambio
fix(modulo): descripción del bug corregido
refactor(modulo): descripción del refactor
test(modulo): descripción de nuevos tests
docs(modulo): cambios en documentación
```

### Change Lifecycle

1. Create OpenSpec change: `/opsx new`
2. Explore/propose: `/opsx explore` → `/opsx propose`
3. Create design & specs: `/opsx design` → `/opsx spec`
4. Break into tasks: `/opsx tasks`
5. Implement: `/opsx apply` (task by task)
6. Verify: `/opsx verify`
7. Archive: `/opsx archive`

---

## Key Conventions

### Backend

- **Module naming**: Lowercase, plural (e.g., `categorias`, `productos`)
- **File naming**: `snake_case.py`
- **Class naming**: `PascalCase` (e.g., `CategoryRepository`)
- **Function naming**: `snake_case` (e.g., `create_category`)
- **Constants**: `UPPER_CASE`

### Frontend

- **Feature naming**: Lowercase (e.g., `categories`, `products`)
- **File naming**: `PascalCase` for components, `camelCase` for utils
- **Component naming**: `PascalCase` (e.g., `CategoryForm`)
- **Type naming**: `IPascalCase` prefix (e.g., `ICategory`)
- **Constant naming**: `UPPER_CASE`

### Database

- **Table naming**: Lowercase singular (e.g., `category`, `product`)
- **Column naming**: Lowercase with underscores (e.g., `created_at`)
- **Index naming**: Prefix with field name (e.g., `category_id_idx`)

---

## Performance Considerations

1. **Database Indexes**:
   - `deleted_at` on all soft-delete tables
   - `category_id` on products table
   - Foreign key constraints automatically indexed

2. **Query Optimization**:
   - Use `include_deleted=False` by default to exclude soft-deleted records
   - Add indexes for frequently filtered columns

3. **Caching**:
   - TanStack Query auto-caches categories list
   - Invalidate on mutation: `queryClient.invalidateQueries({ queryKey: ['categories'] })`

4. **Pagination**: Implement for large datasets (future enhancement)

---

## Security

### Access Control

- `require_role(["ADMIN"])` dependency for admin endpoints
- JWT token validation on all protected endpoints
- Role-based filtering in queries

### Data Protection

- Soft delete prevents accidental data loss
- Audit trail in mutations
- Password hashing with bcrypt
- CORS enabled for frontend origin only

### Validation

- Pydantic schemas validate request data
- Business logic validates invariants (e.g., unique names)
- Frontend validation for UX, backend validation for security

---

## Deployment

### Environment Variables

Create `.env` files in both `backend/` and `frontend/`:

```env
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/foodstore
SECRET_KEY=...
CORS_ORIGINS=https://yourdomain.com

# frontend/.env
VITE_API_URL=https://api.yourdomain.com
```

### Docker (Future)

- Containerize backend (FastAPI + PostgreSQL)
- Containerize frontend (Vite build + nginx)
- Docker Compose for local development

---

## References

- **Backend**: FastAPI docs, SQLModel docs, Pydantic docs
- **Frontend**: React docs, TanStack Query docs, Tailwind docs
- **Testing**: pytest docs, Vitest docs, React Testing Library docs
- **Database**: PostgreSQL docs, Alembic docs
- **Git**: Conventional Commits, Semantic Versioning

