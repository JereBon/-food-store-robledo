import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useOrderStore } from '@/shared/stores/orderStore'

vi.mock('@/shared/api/http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { http } from '@/shared/api/http'

const mockOrder = {
  id: 1,
  usuario_id: 2,
  estado_id: 1,
  estado_nombre: 'PENDIENTE',
  total: 500,
  costo_envio: 50,
  direccion_calle: 'Av. Colón',
  direccion_numero: '100',
  direccion_piso: null,
  direccion_ciudad: 'Córdoba',
  direccion_codigo_postal: null,
  created_at: '2024-01-01T00:00:00',
  items: [],
}

const mockListItem = {
  id: 1,
  estado_id: 1,
  estado_nombre: 'PENDIENTE',
  total: 500,
  created_at: '2024-01-01T00:00:00',
  num_items: 2,
}

describe('orderStore', () => {
  beforeEach(() => {
    useOrderStore.getState().reset()
    vi.clearAllMocks()
  })

  it('placeOrder success sets currentOrder and returns order', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({ data: mockOrder })

    const order = await useOrderStore.getState().placeOrder({
      direccion_id: 1,
      items: [{ producto_id: 1, cantidad: 2, exclusiones: [] }],
    })

    expect(order).toEqual(mockOrder)
    expect(useOrderStore.getState().currentOrder).toEqual(mockOrder)
    expect(useOrderStore.getState().isLoading).toBe(false)
    expect(useOrderStore.getState().error).toBeNull()
  })

  it('placeOrder sets error message on API failure', async () => {
    const apiError = {
      response: { data: { detail: 'Stock insuficiente para producto 1' } },
    }
    vi.mocked(http.post).mockRejectedValueOnce(apiError)

    await expect(
      useOrderStore.getState().placeOrder({ direccion_id: 1, items: [] }),
    ).rejects.toBeDefined()

    expect(useOrderStore.getState().error).toBe('Stock insuficiente para producto 1')
    expect(useOrderStore.getState().isLoading).toBe(false)
  })

  it('fetchMyOrders populates myOrders', async () => {
    vi.mocked(http.get).mockResolvedValueOnce({ data: [mockListItem] })

    await useOrderStore.getState().fetchMyOrders()

    expect(useOrderStore.getState().myOrders).toEqual([mockListItem])
    expect(useOrderStore.getState().isLoading).toBe(false)
    expect(useOrderStore.getState().error).toBeNull()
  })

  it('reset clears all state', () => {
    useOrderStore.setState({
      currentOrder: mockOrder,
      myOrders: [mockListItem],
      error: 'algo falló',
      isLoading: true,
    })

    useOrderStore.getState().reset()

    const state = useOrderStore.getState()
    expect(state.currentOrder).toBeNull()
    expect(state.myOrders).toEqual([])
    expect(state.error).toBeNull()
    expect(state.isLoading).toBe(false)
  })
})
