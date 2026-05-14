import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryForm } from '@/features/categories/widgets/CategoryForm';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import * as api from '@/features/categories/api';

// Mock the API module
vi.mock('@/features/categories/api');

describe('CategoryForm Error Handling', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message when provided as prop', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm onSubmit={handleSubmit} error="Error al crear la categoría" />
      </QueryClientProvider>
    );

    expect(screen.getByText('Error al crear la categoría')).toBeInTheDocument();
  });

  it('shows validation error when name is empty', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const form = screen.getByRole('button', { name: /Crear Categoría/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/El nombre de la categoría es obligatorio/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe('CategoriesPage Delete Flow', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    (api.useCategories as any).mockReturnValue({
      data: [{ id: 1, name: 'Fruits', slug: 'fruits', description: 'Fresh', created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' }],
      isLoading: false,
      error: null,
    });

    (api.useCreateCategory as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    (api.useUpdateCategory as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    (api.useDeleteCategory as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it('opens delete confirmation modal', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    // Click the first delete button in the table
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar/i)).toBeInTheDocument();
    });
  });

  it('shows error when loading categories fails', () => {
    (api.useCategories as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Network error'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Error al cargar las categorías/i)).toBeInTheDocument();
  });
});
