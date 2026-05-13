import { useParams, Link } from 'react-router-dom'
import { useProduct } from '@/features/products/api'
import { AddToCartButton } from '@/features/products/widgets/AddToCartButton'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id ? Number(id) : null)

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-4">{error?.message || 'The product you are looking for does not exist.'}</p>
          <Link to="/catalog" className="text-blue-600 hover:underline">Back to Catalog</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/catalog" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Catalog</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.name} className="w-full rounded-lg shadow-md" />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-semibold mb-4">${Number(product.price).toFixed(2)}</p>

          {product.description && (
            <p className="text-gray-600 mb-4">{product.description}</p>
          )}

          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
            {!product.disponible && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Temporarily Unavailable
              </span>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Categories</h2>
            <div className="flex flex-wrap gap-1">
              {product.categories.length > 0 ? product.categories.map((cat) => (
                <span key={cat.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {cat.name}
                </span>
              )) : <span className="text-xs text-gray-400">No categories</span>}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Ingredients</h2>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.length > 0 ? product.ingredients.map((ing) => (
                <span
                  key={ing.id}
                  className={`text-xs px-2 py-0.5 rounded ${
                    ing.es_alergeno
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ing.nombre}
                  {ing.es_alergeno && ' ⚠'}
                </span>
              )) : <span className="text-xs text-gray-400">No ingredients listed</span>}
            </div>
          </div>

          <AddToCartButton product={product} variant="detail" />
        </div>
      </div>
    </main>
  )
}
