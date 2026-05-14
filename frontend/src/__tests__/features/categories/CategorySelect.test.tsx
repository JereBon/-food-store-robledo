import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategorySelect } from '@/features/categories/widgets/CategorySelect';
import { useCategories } from '@/features/categories/api';

// Mock the useCategories hook
vi.mock('@/features/categories/api', () => ({
  useCategories: vi.fn(),
}));

describe('CategorySelect Component', () => {
  const mockCategories = [
    { id: 1, name: 'Fruits', slug: 'fruits', description: 'Fresh fruits', created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' },
    { id: 2, name: 'Vegetables', slug: 'vegetables', description: 'Green veggies', created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' },
  ];

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with categories loaded', () => {
    (useCategories as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategorySelect />
      </QueryClientProvider>
    );

    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();

    (useCategories as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategorySelect onChange={handleChange} />
      </QueryClientProvider>
    );

    const select = screen.getByDisplayValue('Selecciona una categoría...');
    fireEvent.change(select, { target: { value: '1' } });

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('shows loading state', () => {
    (useCategories as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategorySelect />
      </QueryClientProvider>
    );

    expect(screen.getByText('Cargando categorías...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    (useCategories as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategorySelect />
      </QueryClientProvider>
    );

    expect(screen.getByText('Error al cargar las categorías')).toBeInTheDocument();
  });

  it('can be set to disabled', () => {
    (useCategories as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategorySelect disabled={true} />
      </QueryClientProvider>
    );

    const select = screen.getByDisplayValue('Selecciona una categoría...');
    expect(select).toBeDisabled();
  });
});
