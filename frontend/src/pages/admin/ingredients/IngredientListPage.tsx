import { useState } from 'react'
import { useIngredients, useCreateIngredient, useUpdateIngredient, useDeleteIngredient, useRestoreIngredient } from '@/features/ingredients/api'

export function IngredientListPage() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [esAlergeno, setEsAlergeno] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const { data: ingredients = [], isLoading, error } = useIngredients({ include_deleted: includeDeleted })
  const createMutation = useCreateIngredient()
  const updateMutation = useUpdateIngredient()
  const deleteMutation = useDeleteIngredient()
  const restoreMutation = useRestoreIngredient()

  const resetForm = () => {
    setNombre('')
    setEsAlergeno(false)
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (ing: typeof ingredients[0]) => {
    setNombre(ing.nombre)
    setEsAlergeno(ing.es_alergeno)
    setEditId(ing.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: { nombre: nombre.trim(), es_alergeno: esAlergeno } })
    } else {
      await createMutation.mutateAsync({ nombre: nombre.trim(), es_alergeno: esAlergeno })
    }
    resetForm()
  }

  const handleDelete = () => {
    if (deleteTargetId == null) return
    deleteMutation.mutate(deleteTargetId)
    setShowDeleteModal(false)
    setDeleteTargetId(null)
  }

  const isDeleted = (ing: { deleted_at?: string | null }) => ing.deleted_at != null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gesti&oacute;n de Ingredientes</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="h-4 w-4"
            />
            Mostrar ingredientes eliminados
          </label>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Ingrediente'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={esAlergeno}
              onChange={(e) => setEsAlergeno(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-gray-700">Al&eacute;rgeno</span>
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error.message}</div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminaci&oacute;n</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de que deseas eliminar este ingrediente?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 px-3">Nombre</th>
            <th className="py-2 px-3">Al&eacute;rgeno</th>
            <th className="py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => {
            const deleted = isDeleted(ing)
            return (
              <tr
                key={ing.id}
                className={`border-b hover:bg-gray-50 ${deleted ? 'bg-red-50 line-through text-gray-400' : ''}`}
              >
                <td className="py-2 px-3">
                  {ing.nombre}
                  {deleted && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-red-200 text-red-800 font-semibold no-underline">
                      eliminado
                    </span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    ing.es_alergeno ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ing.es_alergeno ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="py-2 px-3 space-x-2">
                  <button
                    onClick={() => handleEdit(ing)}
                    className={`hover:underline text-sm ${deleted ? 'text-gray-400' : 'text-blue-600'}`}
                  >
                    Editar
                  </button>
                  {deleted ? (
                    <button
                      onClick={() => restoreMutation.mutate(ing.id)}
                      className="text-green-600 hover:underline text-sm font-semibold no-underline"
                    >
                      Reactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => { setDeleteTargetId(ing.id); setShowDeleteModal(true) }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {!isLoading && ingredients.length === 0 && (
        <p className="text-center py-8 text-gray-500">No hay ingredientes a&uacute;n.</p>
      )}
    </div>
  )
}
