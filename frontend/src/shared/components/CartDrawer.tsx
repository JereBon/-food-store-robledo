import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/stores/cartStore'
import { useUiStore } from '@/shared/stores/uiStore'

export function CartDrawer() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } =
    useCartStore()
  const cartOpen = useUiStore((s) => s.cartOpen)
  const setCartOpen = useUiStore((s) => s.setCartOpen)

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setCartOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold">
              Carrito ({totalItems()} artículos)
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Tu carrito está vacío</p>
                <Link
                  to="/catalog"
                  onClick={() => setCartOpen(false)}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Ver catálogo
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} ARS c/u
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                  {item.exclusions.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      Sin: {item.exclusions.join(', ')}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-2 py-0.5 hover:bg-gray-100 text-sm"
                      >
                        -
                      </button>
                      <span className="px-3 py-0.5 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="px-2 py-0.5 hover:bg-gray-100 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)} ARS
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice().toFixed(2)} ARS</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Ver Carrito
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
