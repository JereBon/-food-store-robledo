import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductForm, IProductFormData } from '../../features/products/widgets/ProductForm';
import * as categoryApi from '../../features/categories/api';

// Mock the category API
vi.mock('../../features/categories/api');

describe('ProductForm with Category Integration', () => {
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
    category_id: 1,
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
  });

  it('renders ProductForm with CategorySelect field', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  it('creates product without category (optional)', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Product Name/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock/i);
    const submitButton = screen.getByRole('button', { name: /Create Product/i });

    await user.type(nameInput, 'Banana');
    await user.type(priceInput, '1.99');
    await user.type(stockInput, '30');
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Banana',
      description: null,
      price: 1.99,
      stock: 30,
      category_id: null,
    });
  });

  it('creates product with selected category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Product Name/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock/i);
    const categorySelect = screen.getByDisplayValue('Select a category (optional)');
    const submitButton = screen.getByRole('button', { name: /Create Product/i });

    await user.type(nameInput, 'Orange');
    await user.type(priceInput, '3.49');
    await user.type(stockInput, '25');
    await user.selectOption(categorySelect, '1'); // Select Fruits
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Orange',
      description: null,
      price: 3.49,
      stock: 25,
      category_id: 1,
    });
  });

  it('edits product and changes category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm product={mockProduct} onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    // Verify form is populated
    expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2.99')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();

    // Change category from Fruits to Vegetables
    const categorySelect = screen.getByDisplayValue('Fruits');
    await user.selectOption(categorySelect, '2'); // Select Vegetables

    const submitButton = screen.getByRole('button', { name: /Update Product/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Apple',
      description: 'Fresh apples',
      price: 2.99,
      stock: 50,
      category_id: 2, // Changed category
    });
  });

  it('edits product and removes category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm product={mockProduct} onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    // Remove category selection
    const categorySelect = screen.getByDisplayValue('Fruits');
    await user.selectOption(categorySelect, ''); // Clear selection

    const submitButton = screen.getByRole('button', { name: /Update Product/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Apple',
      description: 'Fresh apples',
      price: 2.99,
      stock: 50,
      category_id: null, // Removed category
    });
  });

  it('validates required fields even with category selected', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const categorySelect = screen.getByDisplayValue('Select a category (optional)');
    const submitButton = screen.getByRole('button', { name: /Create Product/i });

    // Select a category but don't fill required fields
    await user.selectOption(categorySelect, '1');
    await user.click(submitButton);

    expect(screen.getByText(/Product name is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows loading state when submitting with category selected', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} isLoading={true} />
      </QueryClientProvider>
    );

    const categorySelect = screen.getByDisplayValue('Select a category (optional)');
    expect(categorySelect).toBeDisabled();

    const submitButton = screen.getByRole('button', { name: /Saving/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays all available categories in CategorySelect', async () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const categorySelect = screen.getByDisplayValue('Select a category (optional)');
    
    // Options should be available
    expect(categorySelect).toBeInTheDocument();
    expect(categorySelect as HTMLSelectElement).toHaveLength(4); // 1 default + 3 categories
  });

  it('submits complete product form with all fields including category', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const stockInput = screen.getByLabelText(/Stock/i);
    const categorySelect = screen.getByDisplayValue('Select a category (optional)');
    const submitButton = screen.getByRole('button', { name: /Create Product/i });

    await user.type(nameInput, 'Broccoli');
    await user.type(descriptionInput, 'Fresh green broccoli');
    await user.type(priceInput, '4.99');
    await user.type(stockInput, '15');
    await user.selectOption(categorySelect, '2'); // Select Vegetables
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Broccoli',
      description: 'Fresh green broccoli',
      price: 4.99,
      stock: 15,
      category_id: 2,
    });
  });

  it('loads categories on component mount', () => {
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm onSubmit={handleSubmit} />
      </QueryClientProvider>
    );

    expect(categoryApi.useCategories).toHaveBeenCalled();
  });
});
