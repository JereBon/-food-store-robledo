import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type { IIngredient, IIngredientCreate, IIngredientUpdate } from '@/entities/ingredient'

export const useIngredients = (
  es_alergeno?: boolean
): UseQueryResult<IIngredient[], Error> => {
  return useQuery({
    queryKey: ['ingredients', { es_alergeno }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (es_alergeno !== undefined) params.set('es_alergeno', String(es_alergeno))
      const { data } = await http.get<IIngredient[]>(`/ingredientes?${params}`)
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
