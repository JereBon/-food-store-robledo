# Category Management API Documentation

## Overview

The Category Management API provides endpoints for managing product categories in the Food Store e-commerce system. Categories are used to organize and filter products.

**Base URL:** `/api/categories`

**Authentication:** All endpoints require authentication via JWT token in the `Authorization: Bearer {token}` header.

---

## Endpoints

### 1. Create Category

**Endpoint:** `POST /api/categories`

**Required Role:** ADMIN

**Request:**
```json
{
  "name": "Fruits",
  "description": "Fresh fruits and berries"
}
```

**Parameters:**
- `name` (string, required): Category name (max 100 characters, must be unique)
- `description` (string, optional): Category description (max 500 characters)

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Fruits",
  "slug": "fruits",
  "description": "Fresh fruits and berries",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:30:00Z",
  "deleted_at": null
}
```

**Error Responses:**
- `400 Bad Request`: Duplicate name or invalid data
  ```json
  {
    "detail": "A category with name 'Fruits' already exists"
  }
  ```
- `403 Forbidden`: User is not an admin
  ```json
  {
    "detail": "Insufficient permissions"
  }
  ```

---

### 2. List Categories

**Endpoint:** `GET /api/categories`

**Query Parameters:**
- `include_deleted` (boolean, optional): Include soft-deleted categories (default: false, only admins can set to true)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Fruits",
    "slug": "fruits",
    "description": "Fresh fruits and berries",
    "created_at": "2026-05-11T10:30:00Z",
    "updated_at": "2026-05-11T10:30:00Z",
    "deleted_at": null
  },
  {
    "id": 2,
    "name": "Vegetables",
    "slug": "vegetables",
    "description": "Fresh vegetables",
    "created_at": "2026-05-11T10:35:00Z",
    "updated_at": "2026-05-11T10:35:00Z",
    "deleted_at": null
  }
]
```

**Note:** Non-admin users always get non-deleted categories only, regardless of `include_deleted` parameter.

---

### 3. Get Single Category

**Endpoint:** `GET /api/categories/{category_id}`

**Path Parameters:**
- `category_id` (integer): The category ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Fruits",
  "slug": "fruits",
  "description": "Fresh fruits and berries",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:30:00Z",
  "deleted_at": null
}
```

**Error Responses:**
- `404 Not Found`: Category doesn't exist or is deleted

---

### 4. Update Category

**Endpoint:** `PUT /api/categories/{category_id}`

**Required Role:** ADMIN

**Path Parameters:**
- `category_id` (integer): The category ID to update

**Request:**
```json
{
  "name": "Exotic Fruits",
  "description": "Tropical fruits from around the world"
}
```

**Parameters:**
- `name` (string, optional): New category name (if provided, must be unique)
- `description` (string, optional): New category description

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Exotic Fruits",
  "slug": "exotic-fruits",
  "description": "Tropical fruits from around the world",
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T10:45:00Z",
  "deleted_at": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data or duplicate name
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Category doesn't exist or is deleted

---

### 5. Delete Category

**Endpoint:** `DELETE /api/categories/{category_id}`

**Required Role:** ADMIN

**Path Parameters:**
- `category_id` (integer): The category ID to delete

**Implementation Notes:**
- Uses soft delete: sets `deleted_at` timestamp instead of removing from database
- Deleted categories are excluded from public list queries (visible only to admins)

**Response (204 No Content)**

**Error Responses:**
- `400 Bad Request`: Cannot delete category with associated products
  ```json
  {
    "detail": "Cannot delete category with associated products"
  }
  ```
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Category doesn't exist or already deleted

---

## Slug Generation

When a category is created or updated, the API automatically generates a URL-friendly slug:
- Converts to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Ensures uniqueness by appending numeric suffix if needed (e.g., "fruits-1", "fruits-2")

**Example:** `"Organic Fruits & Veggies"` → `"organic-fruits--veggies"` (or `"organic-fruits--veggies-1"` if exists)

---

## Soft Delete Pattern

All categories use soft delete:
- Deleted categories are never permanently removed from the database
- `deleted_at` field is set to the deletion timestamp
- Deleted categories are excluded from public queries by default
- Admin users can view deleted categories with `include_deleted=true` parameter
- Products associated with deleted categories retain their category_id but the category won't be returned in public queries

---

## Relationships

### Products Association

Categories have a one-to-many relationship with Products:
- A category can have many products
- A product can belong to at most one category (category_id is nullable)
- Deleting a category with associated products returns `400 Bad Request`
- To remove a product from a category, update the product with `category_id: null`

---

## Access Control

| Operation | Required Role | Notes |
|-----------|---------------|-------|
| Create Category | ADMIN | Only admins can create new categories |
| List Categories | Any | Non-admins see non-deleted only; admins can filter with `include_deleted` |
| Get Single | Any | Public read access, soft-deleted categories not returned |
| Update Category | ADMIN | Only admins can modify categories |
| Delete Category | ADMIN | Only admins can delete; validation checks for products |

---

## Error Handling

All error responses follow the RFC 7807 Problem Details format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `201 Created`: Category created successfully
- `200 OK`: Request successful
- `204 No Content`: Delete successful (no body)
- `400 Bad Request`: Invalid data or business rule violation
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- No specific rate limits on category endpoints
- General API rate limits apply per user/token

---

## Examples

### Create a new category (curl)

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fruits",
    "description": "Fresh fruits"
  }'
```

### List all categories

```bash
curl -X GET http://localhost:8000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get single category

```bash
curl -X GET http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update category

```bash
curl -X PUT http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Fruits",
    "description": "Organic fresh fruits"
  }'
```

### Delete category

```bash
curl -X DELETE http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## OpenAPI / Swagger

The complete API schema is available in OpenAPI format at:
- **JSON:** `GET /openapi.json`
- **Swagger UI:** Visit `/docs` in your browser
- **ReDoc:** Visit `/redoc` in your browser

Interactive documentation is available in the Swagger UI where you can test all endpoints directly.
