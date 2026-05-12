import { FC, useEffect } from 'react';
import { useCategories } from '../api';
import { ICategory } from '../../../entities/category';

interface CategorySelectProps {
  value?: number | null;
  onChange?: (categoryId: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

/**
 * CategorySelect - dropdown for selecting a category
 */
export const CategorySelect: FC<CategorySelectProps> = ({
  value,
  onChange,
  disabled,
  required,
  label = 'Category',
  placeholder = 'Select a category...',
}) => {
  const { data: categories = [], isLoading, error } = useCategories();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange?.(selectedValue ? parseInt(selectedValue, 10) : null);
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Failed to load categories
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled || isLoading}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      >
        <option value="">{placeholder}</option>
        {categories.map((category: ICategory) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {isLoading && (
        <p className="text-xs text-gray-500">Loading categories...</p>
      )}
    </div>
  );
};

export default CategorySelect;
