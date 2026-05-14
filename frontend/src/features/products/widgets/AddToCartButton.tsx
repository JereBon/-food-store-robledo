import { useState, useMemo } from 'react'
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
  const [outOfStockMsg, setOutOfStockMsg] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useUiStore((s) => s.setCartOpen)

  const cartItem = useCartStore((s) => s.items.find((i) => i.productId === product.id))
  const currentInCart = cartItem?.quantity ?? 0
  const maxAddable = Math.max(0, product.stock - currentInCart)
  const isOutOfStock = !product.disponible || product.stock <= 0 || maxAddable <= 0

  const handleQuickAdd = () => {
    if (maxAddable < 1) {
      setOutOfStockMsg('No hay suficiente stock disponible')
      setTimeout(() => setOutOfStockMsg(null), 3000)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.imagen_url,
      quantity: 1,
      stock: product.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleDetailAdd = (exclusions: number[]) => {
    const toAdd = Math.min(quantity, maxAddable)
    if (toAdd <= 0) {
      setOutOfStockMsg('No hay suficiente stock disponible')
      setTimeout(() => setOutOfStockMsg(null), 3000)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.imagen_url,
      quantity: toAdd,
      exclusions,
      stock: product.stock,
    })
    setShowModal(false)
    setCartOpen(true)
  }

  const stockLabel = useMemo(() => {
    if (product.stock <= 0) return null
    if (maxAddable <= 0) {
      if (currentInCart === 1) return 'Ya tenés 1 en tu carrito'
      return `Ya tenés ${currentInCart} en tu carrito`
    }
    if (maxAddable < 5) {
      if (maxAddable === 1) return '¡Última 1 unidad!'
      return `¡Últimas ${maxAddable} unidades!`
    }
    return null
  }, [product.stock, maxAddable, currentInCart])

  if (variant === 'card') {
    return (
      <div>
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
          {added ? '¡Agregado!' : 'Agregar al carrito'}
        </button>
        {outOfStockMsg && (
          <p className="text-xs text-red-600 mt-1">{outOfStockMsg}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-gray-700">Cantidad:</label>
        <div className="flex items-center border rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 hover:bg-gray-100"
          >
            -
          </button>
          <span className="px-4 py-1 text-sm">{quantity}</span>
          <button
            onClick={() => {
              if (quantity < maxAddable) {
                setQuantity(quantity + 1)
              }
            }}
            disabled={quantity >= maxAddable}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        {currentInCart > 0 && (
          <span className="text-xs text-gray-500">
            ({currentInCart} en tu carrito)
          </span>
        )}
      </div>

      {maxAddable > 0 && maxAddable < 5 && (
        <p className="text-xs text-red-600 font-medium mb-2 animate-pulse">
          {stockLabel}
        </p>
      )}

      {outOfStockMsg && (
        <p className="text-xs text-red-600 mb-2">{outOfStockMsg}</p>
      )}

      <button
        onClick={() => {
          if (isOutOfStock) {
            setOutOfStockMsg(
              currentInCart > 0
                ? `Ya tenés ${currentInCart} en tu carrito y solo hay ${product.stock} en stock`
                : 'No hay suficiente stock disponible'
            )
            setTimeout(() => setOutOfStockMsg(null), 3000)
            return
          }
          if (product.ingredients.length > 0) {
            setShowModal(true)
          } else {
            handleDetailAdd([])
          }
        }}
        disabled={false}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-medium"
      >
        Agregar al carrito
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
