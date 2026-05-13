import { FC } from 'react';
import type { ICategory } from '../../../entities/category';

interface CategoryListProps {
  categories: ICategory[];
  onEdit?: (category: ICategory) => void;
  onDelete?: (category: ICategory) => void;
  onRestore?: (category: ICategory) => void;
  isLoading?: boolean;
}

/**
 * CategoryList - displays categories in a table
 */
export const CategoryList: FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  onRestore,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando categorías...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No se encontraron categorías</div>
      </div>
    );
  }

  const isDeleted = (cat: ICategory) => cat.deleted_at != null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-2 text-left text-sm font-semibold">Nombre</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Slug</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Descripción</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Creado</th>
            <th className="px-4 py-2 text-right text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className={`border-b transition-colors ${
                isDeleted(category)
                  ? 'bg-red-50 line-through text-gray-400 hover:bg-red-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <td className="px-4 py-3 text-sm font-medium">
                {category.name}
                {isDeleted(category) && (
                  <span className="ml-2 text-xs text-red-500 font-normal no-underline inline-block">
                    (eliminada)
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">{category.slug}</td>
              <td className="px-4 py-3 text-sm truncate">
                {category.description || '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(category.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(category)}
                    className={`text-sm font-medium ${
                      isDeleted(category)
                        ? 'text-gray-400 hover:text-gray-600'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Editar
                  </button>
                )}
                {isDeleted(category) ? (
                  onRestore && (
                    <button
                      onClick={() => onRestore(category)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Reactivar
                    </button>
                  )
                ) : (
                  onDelete && (
                    <button
                      onClick={() => onDelete(category)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
