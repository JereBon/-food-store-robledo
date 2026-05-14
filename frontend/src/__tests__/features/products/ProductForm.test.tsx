import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductForm } from '@/features/products/widgets/ProductForm';
import * as categoryApi from '@/features/categories/api';
import * as ingredientApi from '@/features/ingredients/api';

// Mock the APIs
vi.mock('@/features/categories/api');
vi.mock('@/features/ingredients/api', () => ({
  useIngredients: vi.fn(),
}));

describe('ProductForm', () => {
  const mockCategories = [
    { id: 1, name: 'Fruits', slug: 'fruits' },
    { id: 2, name: 'Vegetables', slug: 'vegetables' },
    { id: 3, name: 'Dairy', slug: 'dairy' },
  ];

  const mockProduct = {
    id: 1,
    name: 'Apple',
    description: 'Fresh apples',
    price: 2.99,
    stock: 50,
    disponible: true,
    categories: [{ id: 1, name: 'Fruits' }],
    ingredients: [],
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    (categoryApi.useCategories as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
    });

    (ingredientApi.useIngredients as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders all form fields', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/Nombre del producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stock/i)).toBeInTheDocument();
    expect(screen.getByText('Categorías')).toBeInTheDocument();
  });

  it('creates product without category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Nombre del producto/i);
    const priceInput = screen.getByLabelText(/Precio/i);
    const stockInput = screen.getByLabelText(/Stock/i);
    const submitButton = screen.getByRole('button', { name: /Crear Producto/i });

    await user.type(nameInput, 'Banana');
    await user.type(priceInput, '1.99');
    await user.type(stockInput, '30');
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Banana',
        price: 1.99,
        stock: 30,
        category_ids: [],
      })
    );
  });

  it('creates product with selected category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Nombre del producto/i);
    const priceInput = screen.getByLabelText(/Precio/i);
    const stockInput = screen.getByLabelText(/Stock/i);
    const submitButton = screen.getByRole('button', { name: /Crear Producto/i });

    await user.type(nameInput, 'Orange');
    await user.type(priceInput, '3.49');
    await user.type(stockInput, '25');

    // Click the Fruits checkbox
    const fruitsCheckbox = screen.getByLabelText('Fruits');
    await user.click(fruitsCheckbox);

    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Orange',
        price: 3.49,
        stock: 25,
        category_ids: [1],
      })
    );
  });

  it('edits product and changes category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm product={mockProduct} onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2.99')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();

    // Uncheck Fruits and check Vegetables
    const fruitsCheckbox = screen.getByLabelText('Fruits');
    const vegetablesCheckbox = screen.getByLabelText('Vegetables');
    await user.click(fruitsCheckbox); // uncheck Fruits
    await user.click(vegetablesCheckbox); // check Vegetables

    const submitButton = screen.getByRole('button', { name: /Actualizar Producto/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Apple',
        category_ids: [2],
      })
    );
  });

  it('validates required fields', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    // Use fireEvent.submit to bypass HTML5 validation
    const form = screen.getByRole('button', { name: /Crear Producto/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/El nombre del producto es obligatorio/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows loading state when submitting', async () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} isLoading={true} />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: /Guardando/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays all available categories as checkboxes', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Fruits')).toBeInTheDocument();
    expect(screen.getByLabelText('Vegetables')).toBeInTheDocument();
    expect(screen.getByLabelText('Dairy')).toBeInTheDocument();
  });

  it('loads categories on mount', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(categoryApi.useCategories).toHaveBeenCalled();
  });
});
