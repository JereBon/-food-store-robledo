import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/features/products/api'
import { useCategories } from '@/features/categories/api'
import { AddToCartButton } from '@/features/products/widgets/AddToCartButton'

export function CatalogPage() {
  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()

  const { data, isLoading, error } = useProducts({
    skip,
    limit: 20,
    search: search || undefined,
    category_id: categoryFilter,
  })
  const { data: categories = [] } = useCategories()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setSkip(0)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Catálogo</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar productos..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>

        <select
          value={categoryFilter ?? ''}
          onChange={(e) => {
            setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
            setSkip(0)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error.message}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <Link to={`/catalog/${product.id}`}>
                  {product.imagen_url && (
                    <img
                      src={product.imagen_url}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-600">${Number(product.price).toFixed(2)} ARS</p>
                  <p className="text-sm text-gray-500">
                    {product.stock > 0 ? `${product.stock} en stock` : <span className="text-orange-600 font-medium">No disponible</span>}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.categories.map((cat) => (
                      <span key={cat.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </Link>
                <AddToCartButton product={product} variant="card" />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setSkip(Math.max(0, skip - 20))}
              disabled={skip === 0}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {skip + 1} - {Math.min(skip + 20, data.total)} de {data.total}
            </span>
            <button
              onClick={() => setSkip(skip + 20)}
              disabled={skip + 20 >= data.total}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || categoryFilter
            ? 'No hay productos que coincidan con tu búsqueda.'
            : 'No hay productos disponibles aún.'}
        </div>
      )}
    </main>
  )
}
