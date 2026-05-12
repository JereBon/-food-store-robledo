## Why

Este cambio busca implementar la funcionalidad de gestión de categorías para los productos de la tienda. Actualmente, no existe una forma de organizar los productos por categorías, lo que dificulta la navegación y la búsqueda para los usuarios. Esto permitirá una mejor organización del catálogo de productos y una experiencia de usuario mejorada.

## What Changes

- Se introducirá una nueva entidad `Category` en el backend con sus respectivos endpoints CRUD.
- Se permitirá asociar productos existentes a categorías.
- Se crearán interfaces y componentes en el frontend para la visualización y gestión de categorías.

## Capabilities

### New Capabilities
- `product-categories`: Gestión completa (CRUD) de categorías de productos.
- `associate-product-category`: Funcionalidad para asociar un producto a una categoría existente.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- **Backend**: Nuevos modelos SQLModel para `Category`, nuevos routers y servicios para la gestión de categorías. Modificación del modelo `Product` para incluir una relación con `Category`.
- **Frontend**: Nuevas páginas y componentes para la gestión de categorías. Modificaciones en la página de creación/edición de productos para permitir la selección de categorías.
- **Base de Datos**: Nueva tabla `categories` y modificación de la tabla `products` para incluir `category_id`.
