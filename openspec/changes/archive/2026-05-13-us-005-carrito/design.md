## Context

El carrito existe como store Zustand mínimo (39 líneas) que solo almacena `{ productId, quantity, exclusions }`. No tiene metadatos de producto, no hay UI de ningún tipo, y `addItem` no acepta exclusiones aunque la type lo declare. El `uiStore` tiene `sidebarOpen` que sugiere que se planeó un drawer de carrito, pero nunca se implementó.

## Goals / Non-Goals

**Goals:**
- Reemplazar `CartItem` para incluir `name`, `price`, `image_url` como snapshot al agregar
- Agregar selectores derivados: `totalItems()`, `totalPrice()`, `getItem(productId)`
- Implementar `addItem` con soporte real de `exclusions` y cantidad inicial
- Crear `CartDrawer` (sidebar) con listado, +/- cantidades, exclusión de ingredientes y total
- Crear `CartPage` (`/cart`) con resumen completo y checkout button
- Agregar botón "Add to Cart" en catálogo y detalle de producto
- Badge de cantidad en navegación
- Confirmación modal para "vaciar carrito"

**Non-Goals:**
- No se toca el backend (carrito client-side only, RN-CR01)
- No se implementa checkout / creación de pedidos (es el próximo change, US-035)
- No se implementan validaciones pre-checkout (US-069, US-070)
- No se sincroniza el carrito con el backend

## Decisions

### D1 — CartDrawer (sidebar) + CartPage (ruta dedicada)
**Decisión**: Ambos. Un `CartDrawer` como sidebar deslizable desde cualquier página para acceso rápido, y una página `/cart` para el resumen completo antes de checkout. El drawer se abre desde un botón en la Navigation o al agregar un item.
**Alternativa**: Solo drawer o solo página. El drawer solo es insuficiente para el resumen completo con exclusiones. La página sola fuerza navegación para cualquier interacción con el carrito.
**Impacto**: Dos vistas comparten el mismo store. El drawer muestra versión compacta, la página versión completa.

### D2 — Snapshots de precio/nombre/imagen en el item del carrito
**Decisión**: Al agregar un producto, se almacenan `name`, `price`, `image_url` como snapshot. No se necesita fetch para mostrar el carrito. Esto hace el carrito instantáneo y offline-ready.
**Alternativa**: Solo guardar IDs y fetch productos al abrir el carrito. Descartado porque la especificación dice que el carrito es client-side only y debe funcionar sin conexión al backend.
**Trade-off**: El precio puede quedar desactualizado (US-070 lo manejará en pre-checkout, no en el carrito).

### D3 — Exclusión de ingredientes vía modal al agregar
**Decisión**: Al hacer clic en "Add to Cart" en el detalle de producto, se muestra un modal con la lista de ingredientes del producto y checkboxes para excluir. En el catálogo (vista de lista), el add es rápido sin exclusiones; el usuario puede luego editar desde el drawer.
**Alternativa**: Exclusiones solo desde el carrito. Descartado porque US-030 requiere exclusiones al agregar.

### D4 — Suscripción por slice (selectores) en cartStore
**Decisión**: Los selectores `totalItems()`, `totalPrice()` se implementan como funciones puras fuera del store o como getters de Zustand, usando suscripción por slice para evitar re-renders innecesarios.
**Alternativa**: Calcular en cada render. Descartado por performance con muchos items.
**Impacto**: `const itemCount = useCartStore(s => s.totalItems())` sin re-render del componente entero.

## Risks / Trade-offs

- **Snapshot desactualizado**: Si el precio cambia entre que el usuario agrega al carrito y llega al checkout, puede haber confusión. Mitigación: US-070 (pre-checkout) detectará y notificará diferencias.
- **Persistencia y exclusiones**: Las exclusiones se basan en IDs de ingredientes. Si un ingrediente se elimina del backend, el ID queda huérfano en el carrito. Mitigación: al hacer checkout, validar que los IDs existen; si no, ignorar la exclusión y notificar.
