import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoriesPage } from '../../features/categories/pages/CategoriesPage';
import * as api from '../../features/categories/api';

// Mock the API module
vi.mock('../../features/categories/api');

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

    expect(screen.getByText('Categories Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Category/i })).toBeInTheDocument();
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

    const createButton = screen.getByRole('button', { name: /Create Category/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Category/i)).toBeInTheDocument();
    });
  });

  it('calls create mutation when form is submitted in create mode', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    (api.useCreateCategory as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const createButton = screen.getByRole('button', { name: /Create Category/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Category/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Category Name/i);
    const descInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

    await user.type(nameInput, 'Dairy');
    await user.type(descInput, 'Milk and cheese');
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      name: 'Dairy',
      description: 'Milk and cheese',
    });
  });

  it('opens edit modal when edit action is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Edit Category/i)).toBeInTheDocument();
    });
  });

  it('populates form with category data in edit mode', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fruits')).toBeInTheDocument();
    });
  });

  it('calls update mutation when form is submitted in edit mode', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    (api.useUpdateCategory as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fruits')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Fruits');
    await user.clear(nameInput);
    await user.type(nameInput, 'Exotic Fruits');

    const updateButton = screen.getByRole('button', { name: /Update Category/i });
    await user.click(updateButton);

    expect(mockMutate).toHaveBeenCalledWith({
      id: 1,
      name: 'Exotic Fruits',
      description: 'Fresh fruits',
    });
  });

  it('opens delete confirmation when delete action is clicked', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
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

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledWith(1);
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

    expect(screen.getByText(/Loading categories/i)).toBeInTheDocument();
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

    expect(screen.getByText(/Failed to load categories/i)).toBeInTheDocument();
  });

  it('closes modal after successful submission', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((callback) => callback?.());

    (api.useCreateCategory as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const createButton = screen.getByRole('button', { name: /Create Category/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Category/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Category Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

    await user.type(nameInput, 'Dairy');
    await user.click(submitButton);

    // Modal should be closed after submission
    await waitFor(() => {
      expect(screen.queryByText(/Create New Category/i)).not.toBeInTheDocument();
    });
  });
});
