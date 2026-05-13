import { useState } from 'react'
import { useIngredients, useCreateIngredient, useUpdateIngredient, useDeleteIngredient } from '@/features/ingredients/api'

export function IngredientListPage() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [esAlergeno, setEsAlergeno] = useState(false)

  const { data: ingredients = [], isLoading, error } = useIngredients()
  const createMutation = useCreateIngredient()
  const updateMutation = useUpdateIngredient()
  const deleteMutation = useDeleteIngredient()

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ingredient Management</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {showForm ? 'Cancel' : '+ New Ingredient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
            <span className="text-sm font-medium text-gray-700">Allergen</span>
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {editId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error.message}</div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Allergen</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{ing.nombre}</td>
              <td className="py-2 px-3">
                <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                  ing.es_alergeno ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {ing.es_alergeno ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-2 px-3 space-x-2">
                <button onClick={() => handleEdit(ing)} className="text-blue-600 hover:underline text-sm">Edit</button>
                <button
                  onClick={() => deleteMutation.mutate(ing.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isLoading && ingredients.length === 0 && (
        <p className="text-center py-8 text-gray-500">No ingredients yet.</p>
      )}
    </div>
  )
}
