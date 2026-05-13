import { useState } from 'react'
import { useCartStore } from '@/shared/stores/cartStore'
import { useUiStore } from '@/shared/stores/uiStore'
import type { IProduct } from '@/entities/product'
import { IngredientExclusionModal } from './IngredientExclusionModal'

interface AddToCartButtonProps {
  product: IProduct
  variant?: 'card' | 'detail'
}

export function AddToCartButton({ product, variant = 'card' }: AddToCartButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useUiStore((s) => s.setCartOpen)

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.imagen_url,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleDetailAdd = (exclusions: number[]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.imagen_url,
      quantity,
      exclusions,
    })
    setShowModal(false)
    setCartOpen(true)
  }

  if (variant === 'card') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleQuickAdd()
        }}
        disabled={!product.disponible || product.stock <= 0}
        className={`mt-2 w-full px-3 py-1.5 text-sm rounded transition-colors ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:bg-gray-300 disabled:text-gray-500`}
      >
        {added ? 'Added!' : 'Add to Cart'}
      </button>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center border rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 hover:bg-gray-100"
          >
            -
          </button>
          <span className="px-4 py-1 text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          if (product.ingredients.length > 0) {
            setShowModal(true)
          } else {
            handleDetailAdd([])
          }
        }}
        disabled={!product.disponible || product.stock <= 0}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-medium"
      >
        Add to Cart
      </button>
      {showModal && (
        <IngredientExclusionModal
          ingredients={product.ingredients}
          onConfirm={handleDetailAdd}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
