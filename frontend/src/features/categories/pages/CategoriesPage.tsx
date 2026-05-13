import { FC, useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useRestoreCategory } from '../api';
import type { ICategory } from '../../../entities/category';
import { CategoryForm } from '../widgets/CategoryForm';
import { CategoryList } from '../widgets/CategoryList';

/**
 * CategoriesPage - admin page for managing categories
 */
export const CategoriesPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ICategory | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const { data: categories = [], isLoading, error } = useCategories(includeDeleted);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  const handleRestore = (category: ICategory) => {
    restoreMutation.mutate(category.id);
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: ICategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (err) {
      // Error is handled by mutation
      throw err;
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id, {
        onSuccess: () => {
          setDeleteConfirm(null);
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Nueva Categoría
          </button>
        </div>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="rounded"
          />
          <span>Mostrar categorías eliminadas</span>
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          Error al cargar las categorías: {error.message}
        </div>
      )}

      <CategoryList
        categories={categories}
        onEdit={handleOpenEdit}
        onDelete={(category) => setDeleteConfirm(category)}
        onRestore={handleRestore}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h2>
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleSubmitForm}
              isLoading={isSubmitting}
              error={
                createMutation.error?.message ||
                updateMutation.error?.message
              }
            />
            <button
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="mt-4 w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:text-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-2">Eliminar Categoría</h2>
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar la categoría{' '}
              <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Esta acción no se puede deshacer si la categoría no tiene productos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:text-gray-400"
              >
                Cancelar
              </button>
            </div>
            {deleteMutation.error && (
              <p className="mt-3 text-sm text-red-600">
                {deleteMutation.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
