import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/stores/cartStore'

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } =
    useCartStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Tu Carrito</h1>
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link
          to="/catalog"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ver Catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Tu Carrito ({totalItems()} artículos)
        </h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
        >
          Vaciar Carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.productId}
            className="border rounded-lg p-4 flex items-center gap-4"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">
                ${item.price.toFixed(2)} ARS c/u
              </p>
              {item.exclusions.length > 0 && (
                <p className="text-xs text-gray-500">
                  Ingredientes excluidos:{' '}
                  {item.exclusions.join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center border rounded">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)} ARS
              </p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-xs text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-bold">Total: ${totalPrice().toFixed(2)} ARS</p>
          <p className="text-sm text-gray-500">{totalItems()} artículos</p>
        </div>
        <button
          disabled
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 font-medium"
          title="Próximamente"
        >
          Finalizar Compra
        </button>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-2">Vaciar Carrito</h2>
            <p className="text-gray-700 mb-4">
              ¿Estás seguro? Esto eliminará los {totalItems()} artículos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearCart()
                  setShowClearConfirm(false)
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sí, Vaciar
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
