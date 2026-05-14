import { create } from 'zustand'
import { http } from '@/shared/api/http'

export type OrderStatus = {
  id: number
  nombre: string
}

export type OrderItem = {
  id: number
  producto_id: number
  producto_nombre: string
  imagen_url: string | null
  cantidad: number
  precio_unitario: number
  subtotal: number
  exclusiones: number[]
}

export type Order = {
  id: number
  usuario_id: number
  estado_id: number
  estado_nombre: string | null
  total: number
  costo_envio: number
  direccion_calle: string
  direccion_numero: string | null
  direccion_piso: string | null
  direccion_ciudad: string
  direccion_codigo_postal: string | null
  created_at: string
  items: OrderItem[]
}

export type OrderListItem = {
  id: number
  estado_id: number
  estado_nombre: string | null
  total: number
  created_at: string
  num_items: number
}

export type PlaceOrderPayload = {
  direccion_id: number
  items: { producto_id: number; cantidad: number; exclusiones: number[] }[]
}

type OrderState = {
  currentOrder: Order | null
  myOrders: OrderListItem[]
  isLoading: boolean
  error: string | null
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>
  fetchMyOrders: () => Promise<void>
  fetchOrder: (id: number) => Promise<Order>
  reset: () => void
}

export const useOrderStore = create<OrderState>()((set) => ({
  currentOrder: null,
  myOrders: [],
  isLoading: false,
  error: null,

  placeOrder: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await http.post<Order>('/pedidos', payload)
      set({ currentOrder: data, isLoading: false })
      return data
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: { message?: string } | string } } }
      const detail = axiosErr?.response?.data?.detail
      let errorMsg = 'Error al crear el pedido'
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (detail && typeof detail === 'object' && 'message' in detail) {
        errorMsg = (detail as { message: string }).message
      }
      set({ error: errorMsg, isLoading: false })
      throw err
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await http.get<OrderListItem[]>('/pedidos')
      set({ myOrders: data, isLoading: false })
    } catch {
      set({ error: 'Error al cargar pedidos', isLoading: false })
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await http.get<Order>(`/pedidos/${id}`)
      set({ currentOrder: data, isLoading: false })
      return data
    } catch {
      set({ error: 'Error al cargar el pedido', isLoading: false })
      throw new Error('Error al cargar el pedido')
    }
  },

  reset: () => set({ currentOrder: null, myOrders: [], isLoading: false, error: null }),
}))
