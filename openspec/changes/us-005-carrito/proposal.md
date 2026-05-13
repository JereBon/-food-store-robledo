## Why

El carrito de compras existe como store de Zustand (`cartStore.ts`) pero es mínimo: solo almacena IDs de productos, no tiene metadatos (nombre, precio, imagen), no soporta exclusión de ingredientes, no expone selectores derivados, y lo más crítico — no tiene ninguna interfaz de usuario. Sin un carrito funcional con UI, los clientes no pueden armar pedidos ni avanzar al checkout.

## What Changes

- **CartStore**: ampliar modelo de datos para incluir `name`, `price`, `image_url` por item; agregar selectores `totalItems()`, `totalPrice()`, `getItem(productId)`; agregar soporte real de `exclusions` en `addItem`
- **CartDrawer**: componente sidebar/drawer que muestra items del carrito con cantidad ajustable, exclusión de ingredientes, subtotales y total
- **Botón "Add to Cart"** en catálogo y detalle de producto con selector de cantidad y exclusión de ingredientes
- **Página de carrito** (`/cart`) con resumen completo, modificación de cantidades, eliminación de items y confirmación para vaciar
- **Badge de count** en navegación indicando cantidad de items en el carrito
- **Integración con Navigation**: link al carrito + indicador de cantidad

## Capabilities

### New Capabilities
- `shopping-cart`: Carrito de compras completo con Zustand store mejorado, CartDrawer, página de resumen, botones de agregado y badge de navegación. Client-side only, persistencia localStorage.

### Modified Capabilities
- `frontend-foundation`: El requisito del cartStore pasa de "store base configurado" a "store completo con selectores y metadatos de producto"

## Impact

- **Frontend**: `shared/stores/cartStore.ts` — reescritura completa. Nuevos componentes: `CartDrawer` (widget), `CartPage` (page), `AddToCartButton` (feature). Modificar `Navigation.tsx` para incluir badge y link. Modificar `CatalogPage` y `ProductDetailPage` para botón de agregar
- **Backend**: Sin cambios — el carrito es client-side only (RN-CR01)
- **Ninguna dependencia nueva**
