import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { ICategory, ICategoryCreate, ICategoryUpdate } from '../../entities/category';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

      const response = await fetch(
        `${API_BASE}/categories?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      return response.json();
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
      const response = await fetch(
        `${API_BASE}/categories/${categoryId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.statusText}`);
      }

      return response.json();
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
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          throw new Error('You do not have permission to create categories (admin only)');
        }
        throw new Error(error.detail || `Failed to create category: ${response.statusText}`);
      }

      return response.json();
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
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          throw new Error('You do not have permission to update categories (admin only)');
        }
        throw new Error(error.detail || `Failed to update category: ${response.statusText}`);
      }

      return response.json();
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
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          throw new Error('You do not have permission to delete categories (admin only)');
        }
        if (response.status === 400) {
          throw new Error(error.detail || 'Cannot delete category with active products');
        }
        throw new Error(error.detail || `Failed to delete category: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
