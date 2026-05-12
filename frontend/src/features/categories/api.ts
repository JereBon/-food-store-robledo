import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ICategory, ICategoryCreate, ICategoryUpdate } from '../../entities/category';
import { http } from '@/shared/api/http';

/**
 * Fetch all categories (non-deleted)
 */
export const useCategories = (
  includeDeleted?: boolean
): UseQueryResult<ICategory[], Error> => {
  return useQuery({
    queryKey: ['categories', { includeDeleted }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('include_deleted', 'true');
      }

      try {
        const { data } = await http.get<ICategory[]>(`/categories?${params.toString()}`);
        return data;
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || err.message || 'Failed to fetch categories');
      }
    },
  });
};

/**
 * Fetch a single category by ID
 */
export const useCategory = (
  categoryId: number | null | undefined
): UseQueryResult<ICategory, Error> => {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: async () => {
      try {
        const { data } = await http.get<ICategory>(`/categories/${categoryId}`);
        return data;
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || err.message || 'Failed to fetch category');
      }
    },
    enabled: !!categoryId,
  });
};

/**
 * Create a new category (admin only)
 */
export const useCreateCategory = (): UseMutationResult<
  ICategory,
  Error,
  ICategoryCreate
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICategoryCreate) => {
      try {
        const response = await http.post<ICategory>('/categories', data);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 403) {
          throw new Error('You do not have permission to create categories (admin only)');
        }
        throw new Error(err.response?.data?.detail || err.message || 'Failed to create category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Update an existing category (admin only)
 */
export const useUpdateCategory = (): UseMutationResult<
  ICategory,
  Error,
  { id: number; data: ICategoryUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await http.put<ICategory>(`/categories/${id}`, data);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 403) {
          throw new Error('You do not have permission to update categories (admin only)');
        }
        throw new Error(err.response?.data?.detail || err.message || 'Failed to update category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Delete a category (admin only)
 */
export const useDeleteCategory = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      try {
        await http.delete(`/categories/${categoryId}`);
      } catch (err: any) {
        if (err.response?.status === 403) {
          throw new Error('You do not have permission to delete categories (admin only)');
        }
        if (err.response?.status === 400) {
          throw new Error(err.response?.data?.detail || 'Cannot delete category with active products');
        }
        throw new Error(err.response?.data?.detail || err.message || 'Failed to delete category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
