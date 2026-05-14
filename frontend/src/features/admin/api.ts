import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { http } from '@/shared/api/http'

// ── Types ───────────────────────────────────────────────────────────

export interface UserListItem {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  is_active: boolean
  roles: string[]
  created_at: string
}

export interface UserListResponse {
  items: UserListItem[]
  total: number
  page: number
  page_size: number
}

export interface UserUpdateRequest {
  nombre?: string
  apellido?: string
  telefono?: string
  is_active?: boolean
  roles?: string[]
}

export interface PedidosPorEstadoItem {
  code: string
  name: string
  cantidad: number
}

export interface MetricasResumenResponse {
  total_ventas: number
  total_pedidos: number
  pedidos_por_estado: PedidosPorEstadoItem[]
  total_usuarios: number
}

export interface VentasPorPeriodoItem {
  periodo: string
  monto: number
  cantidad: number
}

export interface VentasPorPeriodoResponse {
  items: VentasPorPeriodoItem[]
}

export interface TopProductoItem {
  producto_id: number
  nombre: string
  total_unidades: number
}

export interface TopProductosResponse {
  items: TopProductoItem[]
}

// ── List users ──────────────────────────────────────────────────────

interface ListUsersParams {
  q?: string
  rol?: string
  page?: number
  page_size?: number
}

export const useListUsers = (
  params: ListUsersParams
): UseQueryResult<UserListResponse, Error> => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params.q) sp.set('q', params.q)
      if (params.rol) sp.set('rol', params.rol)
      if (params.page) sp.set('page', String(params.page))
      if (params.page_size) sp.set('page_size', String(params.page_size))
      const { data } = await http.get<UserListResponse>(`/admin/usuarios?${sp}`)
      return data
    },
  })
}

// ── Update user ─────────────────────────────────────────────────────

export const useUpdateUser = (): UseMutationResult<
  UserListItem,
  Error,
  { id: number; data: UserUpdateRequest }
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await http.put<UserListItem>(`/admin/usuarios/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

// ── Metrics: Resumen ────────────────────────────────────────────────

interface MetricasParams {
  desde?: string
  hasta?: string
}

export const useMetricasResumen = (
  params?: MetricasParams
): UseQueryResult<MetricasResumenResponse, Error> => {
  return useQuery({
    queryKey: ['admin', 'metricas', 'resumen', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params?.desde) sp.set('desde', params.desde)
      if (params?.hasta) sp.set('hasta', params.hasta)
      const { data } = await http.get<MetricasResumenResponse>(
        `/admin/metricas/resumen?${sp}`
      )
      return data
    },
  })
}

// ── Metrics: Ventas series ──────────────────────────────────────────

interface VentasParams {
  desde?: string
  hasta?: string
  granularidad?: 'dia' | 'semana' | 'mes'
}

export const useVentasSeries = (
  params?: VentasParams
): UseQueryResult<VentasPorPeriodoResponse, Error> => {
  return useQuery({
    queryKey: ['admin', 'metricas', 'ventas', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params?.desde) sp.set('desde', params.desde)
      if (params?.hasta) sp.set('hasta', params.hasta)
      if (params?.granularidad) sp.set('granularidad', params.granularidad)
      const { data } = await http.get<VentasPorPeriodoResponse>(
        `/admin/metricas/ventas?${sp}`
      )
      return data
    },
  })
}

// ── Metrics: Top productos ─────────────────────────────────────────

interface TopProductosParams {
  desde?: string
  hasta?: string
  limite?: number
}

export const useTopProductos = (
  params?: TopProductosParams
): UseQueryResult<TopProductosResponse, Error> => {
  return useQuery({
    queryKey: ['admin', 'metricas', 'top-productos', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params?.desde) sp.set('desde', params.desde)
      if (params?.hasta) sp.set('hasta', params.hasta)
      if (params?.limite) sp.set('limite', String(params.limite))
      const { data } = await http.get<TopProductosResponse>(
        `/admin/metricas/productos-top?${sp}`
      )
      return data
    },
  })
}
