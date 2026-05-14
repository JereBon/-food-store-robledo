import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryForm } from '@/features/categories/widgets/CategoryForm';
import { ICategory } from '@/entities/category';

describe('CategoryForm Component', () => {
  const mockCategory: ICategory = {
    id: 1,
    name: 'Fruits',
    slug: 'fruits',
    description: 'Fresh fruits',
    created_at: '2026-05-11T00:00:00Z',
    updated_at: '2026-05-11T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with empty fields for create mode', () => {
    const handleSubmit = vi.fn();

    render(<CategoryForm onSubmit={handleSubmit} />);

    expect(screen.getByLabelText(/Nombre de la Categoría/i)).toHaveValue('');
    expect(screen.getByLabelText(/Descripción/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Crear Categoría/i })).toBeInTheDocument();
  });

  it('renders form with category data for edit mode', () => {
    const handleSubmit = vi.fn();

    render(<CategoryForm category={mockCategory} onSubmit={handleSubmit} />);

    expect(screen.getByLabelText(/Nombre de la Categoría/i)).toHaveValue('Fruits');
    expect(screen.getByLabelText(/Descripción/i)).toHaveValue('Fresh fruits');
    expect(screen.getByRole('button', { name: /Actualizar Categoría/i })).toBeInTheDocument();
  });

  it('validates required name field', () => {
    const handleSubmit = vi.fn();

    render(<CategoryForm onSubmit={handleSubmit} />);

    // Use fireEvent.submit to bypass HTML5 required validation
    const form = screen.getByRole('button', { name: /Crear Categoría/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/El nombre de la categoría es obligatorio/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('has maxLength attribute on name input', () => {
    const handleSubmit = vi.fn();

    render(<CategoryForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/Nombre de la Categoría/i);
    expect(nameInput).toHaveAttribute('maxLength', '100');
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<CategoryForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/Nombre de la Categoría/i);
    const descInput = screen.getByLabelText(/Descripción/i);
    const submitButton = screen.getByRole('button', { name: /Crear Categoría/i });

    await user.type(nameInput, 'Vegetables');
    await user.type(descInput, 'Green veggies');
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Vegetables',
      description: 'Green veggies',
    });
  });

  it('shows loading state during submission', async () => {
    const handleSubmit = vi.fn(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();

    render(<CategoryForm onSubmit={handleSubmit} isLoading={true} />);

    const nameInput = screen.getByLabelText(/Nombre de la Categoría/i);
    expect(nameInput).toBeDisabled();

    const submitButton = screen.getByRole('button', { name: /Guardando/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message', () => {
    const handleSubmit = vi.fn();
    const errorMsg = 'Category name already exists';

    render(
      <CategoryForm onSubmit={handleSubmit} error={errorMsg} />
    );

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });
});
