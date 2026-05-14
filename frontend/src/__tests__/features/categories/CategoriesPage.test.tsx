import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import * as api from '@/features/categories/api';

// Mock the API module
vi.mock('@/features/categories/api');

describe('CategoriesPage', () => {
  const mockCategories = [
    { id: 1, name: 'Fruits', slug: 'fruits', description: 'Fresh fruits', created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' },
    { id: 2, name: 'Vegetables', slug: 'vegetables', description: 'Green veggies', created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' },
  ];

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (api.useCategories as any).mockReturnValue({
      data: mockCategories,
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

    (api.useCategory as any).mockReturnValue({
      data: mockCategories[0],
      isLoading: false,
      error: null,
    });
  });

  it('renders categories page with title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Gestión de Categorías')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva Categoría/i })).toBeInTheDocument();
  });

  it('renders categories list', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Fresh fruits')).toBeInTheDocument();
  });

  it('opens create modal when Create Category button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const createButton = screen.getByRole('button', { name: /Nueva Categoría/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Crear Nueva Categoría/i)).toBeInTheDocument();
    });
  });

  it('calls create mutation when form is submitted in create mode', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

    (api.useCreateCategory as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const createButton = screen.getByRole('button', { name: /Nueva Categoría/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Crear Nueva Categoría/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Nombre de la Categoría/i);
    const descInput = screen.getByLabelText(/Descripción/i);
    const submitButton = screen.getByRole('button', { name: /Crear Categoría/i });

    await user.type(nameInput, 'Dairy');
    await user.type(descInput, 'Milk and cheese');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Dairy',
        description: 'Milk and cheese',
      });
    });
  });

  it('opens edit modal when edit action is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Editar Categoría/i)).toBeInTheDocument();
    });
  });

  it('populates form with category data in edit mode', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fruits')).toBeInTheDocument();
    });
  });

  it('calls update mutation when form is submitted in edit mode', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

    (api.useUpdateCategory as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fruits')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Fruits');
    await user.clear(nameInput);
    await user.type(nameInput, 'Exotic Fruits');

    const updateButton = screen.getByRole('button', { name: /Actualizar Categoría/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: {
          name: 'Exotic Fruits',
          description: 'Fresh fruits',
        },
      });
    });
  });

  it('opens delete confirmation when delete action is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar/i)).toBeInTheDocument();
    });
  });

  it('calls delete mutation when confirmed', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    (api.useDeleteCategory as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    // Click the first "Eliminar" in the table (the modal is not yet open)
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar/i)).toBeInTheDocument();
    });

    // Now find the confirm button inside the modal (last "Eliminar" button)
    const allDeleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1];
    await user.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledWith(1, expect.objectContaining({}));
  });

  it('shows loading state in list when fetching', () => {
    (api.useCategories as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Cargando categorías/i)).toBeInTheDocument();
  });

  it('shows error message if loading fails', () => {
    (api.useCategories as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load categories'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Error al cargar las categorías/i)).toBeInTheDocument();
  });

  it('closes modal after successful submission', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn().mockResolvedValue(undefined);

    (api.useCreateCategory as any).mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const createButton = screen.getByRole('button', { name: /Nueva Categoría/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Crear Nueva Categoría/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Nombre de la Categoría/i);
    const submitButton = screen.getByRole('button', { name: /Crear Categoría/i });

    await user.type(nameInput, 'Dairy');
    await user.click(submitButton);

    // Modal should be closed after submission
    await waitFor(() => {
      expect(screen.queryByText(/Crear Nueva Categoría/i)).not.toBeInTheDocument();
    });
  });
});
