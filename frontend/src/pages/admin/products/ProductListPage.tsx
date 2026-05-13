import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useDeleteProduct, useUpdateStock } from '@/features/products/api'

export function ProductListPage() {
  const [skip, setSkip] = useState(0)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [stockEdit, setStockEdit] = useState<{ id: number; value: string } | null>(null)

  const { data, isLoading, error } = useProducts({ skip, limit: 20 })
  const deleteMutation = useDeleteProduct()
  const stockMutation = useUpdateStock()

  const handleStockUpdate = async (productId: number) => {
    if (!stockEdit) return
    const cantidad = parseInt(stockEdit.value, 10)
    if (isNaN(cantidad) || cantidad < 0) return
    await stockMutation.mutateAsync({ id: productId, cantidad })
    setStockEdit(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          + New Product
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error.message}</div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Price</th>
            <th className="py-2 px-3">Stock</th>
            <th className="py-2 px-3">Available</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{product.name}</td>
              <td className="py-2 px-3">${Number(product.price).toFixed(2)}</td>
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
                      Save
                    </button>
                    <button
                      onClick={() => setStockEdit(null)}
                      className="px-2 py-1 border text-xs rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setStockEdit({ id: product.id, value: String(product.stock) })}
                    className="text-blue-600 hover:underline"
                  >
                    {product.stock}
                  </button>
                )}
              </td>
              <td className="py-2 px-3">
                <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                  product.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.disponible ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-2 px-3 space-x-2">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(product.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && data.items.length === 0 && (
        <p className="text-center py-8 text-gray-500">No products found.</p>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setSkip(Math.max(0, skip - 20))}
          disabled={skip === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">
          {data ? `${skip + 1}-${Math.min(skip + 20, data.total)} of ${data.total}` : ''}
        </span>
        <button
          onClick={() => setSkip(skip + 20)}
          disabled={!data || skip + 20 >= data.total}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
