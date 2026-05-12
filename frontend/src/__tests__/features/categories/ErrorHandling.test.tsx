import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryForm } from '../../features/categories/widgets/CategoryForm';
import { CategoriesPage } from '../../features/categories/pages/CategoriesPage';
import * as api from '../../features/categories/api';

// Mock the API module
vi.mock('../../features/categories/api');

describe('Category Error Handling - Access Control (403)', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows 403 Forbidden error when non-admin tries to create category', async () => {
    const user = userEvent.setup();
    const error = { response: { status: 403, data: { detail: 'Insufficient permissions' } } };

    (api.useCreateCategory as any).mockReturnValue({
      mutate: vi.fn((data, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
      error: null,
    });

    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Category Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

    await user.type(nameInput, 'Fruits');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Insufficient permissions|403/i)).toBeInTheDocument();
    });
  });

  it('shows 403 Forbidden error when non-admin tries to update category', async () => {
    const user = userEvent.setup();
    const error = { response: { status: 403, data: { detail: 'Admin access required' } } };

    (api.useUpdateCategory as any).mockReturnValue({
      mutate: vi.fn((data, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
      error: null,
    });

    const mockCategory = {
      id: 1,
      name: 'Fruits',
      slug: 'fruits',
      description: 'Fresh fruits',
    };

    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm category={mockCategory} onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByDisplayValue('Fruits');
    const submitButton = screen.getByRole('button', { name: /Update Category/i });

    await user.clear(nameInput);
    await user.type(nameInput, 'New Fruits');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Admin access required|403/i)).toBeInTheDocument();
    });
  });

  it('shows 403 Forbidden error when non-admin tries to delete category', async () => {
    const user = userEvent.setup();
    const error = { response: { status: 403, data: { detail: 'Admin access required' } } };

    (api.useCategories as any).mockReturnValue({
      data: [{ id: 1, name: 'Fruits', slug: 'fruits', description: 'Fresh' }],
      isLoading: false,
      error: null,
    });

    (api.useDeleteCategory as any).mockReturnValue({
      mutate: vi.fn((id, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
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

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Admin access required|403/i)).toBeInTheDocument();
    });
  });
});

describe('Category Error Handling - Duplicate Names', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when trying to create category with duplicate name', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        status: 400,
        data: { detail: 'A category with name "Fruits" already exists' },
      },
    };

    (api.useCreateCategory as any).mockReturnValue({
      mutate: vi.fn((data, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
      error: null,
    });

    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Category Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

    await user.type(nameInput, 'Fruits');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('shows error when trying to update category to duplicate name', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        status: 400,
        data: { detail: 'A category with name "Vegetables" already exists' },
      },
    };

    (api.useUpdateCategory as any).mockReturnValue({
      mutate: vi.fn((data, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
      error: null,
    });

    const mockCategory = {
      id: 1,
      name: 'Fruits',
      slug: 'fruits',
      description: 'Fresh fruits',
    };

    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm category={mockCategory} onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByDisplayValue('Fruits');
    const submitButton = screen.getByRole('button', { name: /Update Category/i });

    await user.clear(nameInput);
    await user.type(nameInput, 'Vegetables');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('shows error when trying to delete category with associated products', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        status: 409,
        data: { detail: 'Cannot delete category with associated products' },
      },
    };

    (api.useCategories as any).mockReturnValue({
      data: [{ id: 1, name: 'Fruits', slug: 'fruits', description: 'Fresh' }],
      isLoading: false,
      error: null,
    });

    (api.useDeleteCategory as any).mockReturnValue({
      mutate: vi.fn((id, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
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

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Cannot delete category with associated products|409/i)
      ).toBeInTheDocument();
    });
  });
});

describe('Category Error Handling - Server Errors', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows generic error when server returns 500', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        status: 500,
        data: { detail: 'Internal server error' },
      },
    };

    (api.useCreateCategory as any).mockReturnValue({
      mutate: vi.fn((data, { onError }) => {
        setTimeout(() => onError(error), 0);
      }),
      isPending: false,
      error: null,
    });

    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Category Name/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

    await user.type(nameInput, 'Fruits');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Internal server error|500/i)).toBeInTheDocument();
    });
  });

  it('shows error when failing to load categories', () => {
    (api.useCategories as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Network error'),
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

    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Network error|Failed/i)).toBeInTheDocument();
  });
});
