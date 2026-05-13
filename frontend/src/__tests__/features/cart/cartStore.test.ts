import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/shared/stores/cartStore'

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('adds item to empty cart', () => {
    useCartStore.getState().addItem({
      productId: 1,
      name: 'Apple',
      price: 1.5,
      quantity: 2,
    })
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Apple')
    expect(items[0].quantity).toBe(2)
    expect(items[0].price).toBe(1.5)
  })

  it('increments quantity when adding existing product', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5, quantity: 1 })
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5, quantity: 2 })
    const item = useCartStore.getState().items[0]
    expect(item.quantity).toBe(3)
  })

  it('stores exclusions when adding item', () => {
    useCartStore.getState().addItem({
      productId: 1,
      name: 'Pizza',
      price: 10,
      exclusions: [2, 5],
    })
    expect(useCartStore.getState().items[0].exclusions).toEqual([2, 5])
  })

  it('updates quantity of existing item', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5, quantity: 1 })
    useCartStore.getState().updateQuantity(1, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5 })
    useCartStore.getState().updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes item by productId', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5 })
    useCartStore.getState().addItem({ productId: 2, name: 'Banana', price: 2.0 })
    useCartStore.getState().removeItem(1)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].name).toBe('Banana')
  })

  it('clears all items', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5 })
    useCartStore.getState().addItem({ productId: 2, name: 'Banana', price: 2.0 })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('totalItems returns sum of quantities', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'A', price: 1, quantity: 2 })
    useCartStore.getState().addItem({ productId: 2, name: 'B', price: 2, quantity: 3 })
    expect(useCartStore.getState().totalItems()).toBe(5)
  })

  it('totalPrice returns sum of price * quantity', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'A', price: 10, quantity: 2 })
    useCartStore.getState().addItem({ productId: 2, name: 'B', price: 5, quantity: 3 })
    expect(useCartStore.getState().totalPrice()).toBe(35)
  })

  it('getItem returns correct item', () => {
    useCartStore.getState().addItem({ productId: 1, name: 'Apple', price: 1.5 })
    const item = useCartStore.getState().getItem(1)
    expect(item?.name).toBe('Apple')
  })

  it('getItem returns undefined for missing item', () => {
    expect(useCartStore.getState().getItem(999)).toBeUndefined()
  })
})
