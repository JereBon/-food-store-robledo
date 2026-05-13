import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type { IProduct, IProductCreate, IProductUpdate, IProductListResponse } from '@/entities/product'

interface ProductListParams {
  skip?: number
  limit?: number
  search?: string
  category_id?: number
}

export const useProducts = (
  params?: ProductListParams
): UseQueryResult<IProductListResponse, Error> => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params?.skip) sp.set('skip', String(params.skip))
      if (params?.limit) sp.set('limit', String(params.limit))
      if (params?.search) sp.set('search', params.search)
      if (params?.category_id) sp.set('category_id', String(params.category_id))
      const { data } = await http.get<IProductListResponse>(`/products?${sp}`)
      return data
    },
  })
}

export const useProduct = (
  productId: number | null | undefined
): UseQueryResult<IProduct, Error> => {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const { data } = await http.get<IProduct>(`/products/${productId}`)
      return data
    },
    enabled: !!productId,
  })
}

export const useCreateProduct = (): UseMutationResult<IProduct, Error, IProductCreate> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await http.post<IProduct>('/products', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useUpdateProduct = (): UseMutationResult<
  IProduct,
  Error,
  { id: number; data: IProductUpdate }
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await http.put<IProduct>(`/products/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useDeleteProduct = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useSetProductIngredients = (): UseMutationResult<
  IProduct,
  Error,
  { id: number; ingredients: { ingrediente_id: number; es_removible: boolean }[] }
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ingredients }) => {
      const { data } = await http.put<IProduct>(`/products/${id}/ingredients`, ingredients)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useUpdateStock = (): UseMutationResult<
  IProduct,
  Error,
  { id: number; cantidad: number }
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, cantidad }) => {
      const { data } = await http.patch<IProduct>(`/products/${id}/stock?cantidad=${cantidad}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
