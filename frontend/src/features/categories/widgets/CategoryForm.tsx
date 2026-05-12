import { FC, useState, useEffect } from 'react';
import type { ICategory, ICategoryCreate, ICategoryUpdate } from '../../../entities/category';

interface CategoryFormProps {
  category?: ICategory | null;
  onSubmit: (data: ICategoryCreate | ICategoryUpdate) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * CategoryForm - form for creating or editing a category
 */
export const CategoryForm: FC<CategoryFormProps> = ({
  category,
  onSubmit,
  isLoading,
  error,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError('El nombre de la categoría es obligatorio');
      return;
    }

    if (name.length > 100) {
      setLocalError('El nombre de la categoría debe tener 100 caracteres o menos');
      return;
    }

    if (description.length > 500) {
      setLocalError('La descripción debe tener 500 caracteres o menos');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Ocurrió un error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {(localError || error) && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {localError || error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Categoría *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingresa el nombre de la categoría"
          maxLength={100}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          {name.length}/100 caracteres
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ingresa la descripción de la categoría (opcional)"
          maxLength={500}
          rows={4}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length}/500 caracteres
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Guardando...' : category ? 'Actualizar Categoría' : 'Crear Categoría'}
      </button>
    </form>
  );
};

export default CategoryForm;
