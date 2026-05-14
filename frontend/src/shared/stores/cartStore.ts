import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: number
  name: string
  price: number
  image_url?: string | null
  quantity: number
  exclusions: number[]
  stock: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: {
    productId: number
    name: string
    price: number
    image_url?: string | null
    quantity?: number
    exclusions?: number[]
    stock?: number
  }) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  getItem: (productId: number) => CartItem | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ productId, name, price, image_url, quantity = 1, exclusions = [], stock = 0 }) => {
        const items = get().items
        const existing = items.find((i) => i.productId === productId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          })
          return
        }
        set({
          items: [
            ...items,
            { productId, name, price, image_url, quantity, exclusions, stock },
          ],
        })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) })
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItem: (productId) => get().items.find((i) => i.productId === productId),
    }),
    { name: 'food-store-cart' },
  ),
)
