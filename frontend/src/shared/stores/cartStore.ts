import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  productId: number
  quantity: number
  exclusions: number[]
}

type CartState = {
  items: CartItem[]
  addItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        const items = get().items
        const existing = items.find((i) => i.productId === productId)
        if (existing) {
          set({ items: items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)) })
          return
        }
        set({ items: [...items, { productId, quantity: 1, exclusions: [] }] })
      },
      updateQuantity: (productId, quantity) => {
        set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) })
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'foodstore-cart' },
  ),
)
