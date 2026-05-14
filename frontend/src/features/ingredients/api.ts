import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type { IIngredient, IIngredientCreate, IIngredientUpdate } from '@/entities/ingredient'

export interface IngredientListResponse {
  items: IIngredient[]
  total: number
  skip: number
  limit: number
}

interface IngredientListParams {
  es_alergeno?: boolean
  include_deleted?: boolean
}

export const useIngredients = (
  params?: IngredientListParams
): UseQueryResult<IIngredient[], Error> => {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: async () => {
      const sp = new URLSearchParams({ skip: '0', limit: '100' })
      if (params?.es_alergeno !== undefined) sp.set('es_alergeno', String(params.es_alergeno))
      if (params?.include_deleted) sp.set('include_deleted', 'true')
      const { data } = await http.get<IngredientListResponse>(`/ingredientes?${sp}`)
      return data.items
    },
  })
}

export const useIngredientsPaginated = (
  includeDeleted: boolean,
  skip: number,
  limit: number = 20
): UseQueryResult<IngredientListResponse, Error> => {
  return useQuery({
    queryKey: ['ingredients', 'paginated', { includeDeleted, skip, limit }],
    queryFn: async () => {
      const sp = new URLSearchParams()
      sp.set('skip', String(skip))
      sp.set('limit', String(limit))
      if (includeDeleted) sp.set('include_deleted', 'true')
      const { data } = await http.get<IngredientListResponse>(`/ingredientes?${sp}`)
      return data
    },
  })
}

export const useIngredient = (
  ingredientId: number | null | undefined
): UseQueryResult<IIngredient, Error> => {
  return useQuery({
    queryKey: ['ingredients', ingredientId],
    queryFn: async () => {
      const { data } = await http.get<IIngredient>(`/ingredientes/${ingredientId}`)
      return data
    },
    enabled: !!ingredientId,
  })
}

export const useCreateIngredient = (): UseMutationResult<IIngredient, Error, IIngredientCreate> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await http.post<IIngredient>('/ingredientes', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export const useUpdateIngredient = (): UseMutationResult<
  IIngredient,
  Error,
  { id: number; data: IIngredientUpdate }
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await http.put<IIngredient>(`/ingredientes/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export const useRestoreIngredient = (): UseMutationResult<IIngredient, Error, number> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.patch<IIngredient>(`/ingredientes/${id}/restore`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export const useDeleteIngredient = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/ingredientes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}
