import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useDeleteProduct, useUpdateStock, useRestoreProduct } from '@/features/products/api'

export function ProductListPage() {
  const [skip, setSkip] = useState(0)
  const [stockEdit, setStockEdit] = useState<{ id: number; value: string } | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const { data, error } = useProducts({ skip, limit: 20, include_deleted: includeDeleted })
  const deleteMutation = useDeleteProduct()
  const stockMutation = useUpdateStock()
  const restoreMutation = useRestoreProduct()

  const handleStockUpdate = async (productId: number) => {
    if (!stockEdit) return
    const cantidad = parseInt(stockEdit.value, 10)
    if (isNaN(cantidad) || cantidad < 0) return
    await stockMutation.mutateAsync({ id: productId, cantidad })
    setStockEdit(null)
  }

  const handleDelete = () => {
    if (deleteTargetId == null) return
    deleteMutation.mutate(deleteTargetId)
    setShowDeleteModal(false)
    setDeleteTargetId(null)
  }

  const isDeleted = (product: { deleted_at?: string | null }) => product.deleted_at != null

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gesti&oacute;n de Productos</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => { setIncludeDeleted(e.target.checked); setSkip(0) }}
              className="h-4 w-4"
            />
            Mostrar productos eliminados
          </label>
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Nuevo Producto
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error.message}</div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminaci&oacute;n</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de que deseas eliminar este producto?</p>
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
            <th className="py-2 px-3">Precio</th>
            <th className="py-2 px-3">Stock</th>
            <th className="py-2 px-3">Disponible</th>
            <th className="py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((product) => {
            const deleted = isDeleted(product)
            return (
              <tr
                key={product.id}
                className={`border-b hover:bg-gray-50 ${deleted ? 'bg-red-50 line-through text-gray-400' : ''}`}
              >
                <td className="py-2 px-3">
                  {product.name}
                  {deleted && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-red-200 text-red-800 font-semibold no-underline">
                      eliminado
                    </span>
                  )}
                </td>
                <td className="py-2 px-3">${Number(product.price).toFixed(2)} ARS</td>
                <td className="py-2 px-3">
                  {stockEdit?.id === product.id ? (
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={stockEdit.value}
                        onChange={(e) => setStockEdit({ ...stockEdit, value: e.target.value })}
                        className="w-20 px-2 py-1 border rounded"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockUpdate(product.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setStockEdit(null)}
                        className="px-2 py-1 border text-xs rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStockEdit({ id: product.id, value: String(product.stock) })}
                      className={`hover:underline ${deleted ? 'text-gray-400' : 'text-blue-600'}`}
                    >
                      {product.stock}
                    </button>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    product.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.disponible ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="py-2 px-3 space-x-2">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className={`hover:underline text-sm ${deleted ? 'text-gray-400' : 'text-blue-600'}`}
                  >
                    Editar
                  </Link>
                  {deleted ? (
                    <button
                      onClick={() => restoreMutation.mutate(product.id)}
                      className="text-green-600 hover:underline text-sm font-semibold no-underline"
                    >
                      Reactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => { setDeleteTargetId(product.id); setShowDeleteModal(true) }}
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

      {data && data.items.length === 0 && (
        <p className="text-center py-8 text-gray-500">No se encontraron productos.</p>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setSkip(Math.max(0, skip - 20))}
          disabled={skip === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">
          {data ? `${skip + 1}-${Math.min(skip + 20, data.total)} de ${data.total}` : ''}
        </span>
        <button
          onClick={() => setSkip(skip + 20)}
          disabled={!data || skip + 20 >= data.total}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
