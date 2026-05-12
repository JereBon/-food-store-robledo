import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryForm } from '../../features/categories/widgets/CategoryForm';
import { ICategory } from '../../entities/category';

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

    expect(screen.getByLabelText(/Category Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Create Category/i })).toBeInTheDocument();
  });

  it('renders form with category data for edit mode', () => {
    const handleSubmit = vi.fn();

    render(<CategoryForm category={mockCategory} onSubmit={handleSubmit} />);

    expect(screen.getByLabelText(/Category Name/i)).toHaveValue('Fruits');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Fresh fruits');
    expect(screen.getByRole('button', { name: /Update Category/i })).toBeInTheDocument();
  });

  it('validates required name field', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<CategoryForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Create Category/i });
    await user.click(submitButton);

    expect(screen.getByText(/Category name is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates name max length', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<CategoryForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/Category Name/i);
    await user.type(nameInput, 'a'.repeat(101));

    expect(screen.getByText(/must be 100 characters or less/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<CategoryForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/Category Name/i);
    const descInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Category/i });

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

    const nameInput = screen.getByLabelText(/Category Name/i);
    expect(nameInput).toBeDisabled();

    const submitButton = screen.getByRole('button', { name: /Saving/i });
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
