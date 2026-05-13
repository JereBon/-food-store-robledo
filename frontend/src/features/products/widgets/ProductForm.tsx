import { FC, useState, useEffect } from 'react'
import { useCategories } from '../../categories/api'

export interface IProductFormData {
  name: string
  description?: string | null
  price: number
  stock: number
  disponible: boolean
  imagen_url?: string | null
  category_ids: number[]
}

interface ProductFormProps {
  product?: any
  onSubmit: (data: IProductFormData) => void | Promise<void>
  isLoading?: boolean
  error?: string | null
}

export const ProductForm: FC<ProductFormProps> = ({
  product,
  onSubmit,
  isLoading,
  error,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [imagenUrl, setImagenUrl] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [localError, setLocalError] = useState<string | null>(null)

  const { data: categories = [] } = useCategories()

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setDescription(product.description || '')
      setPrice(product.price?.toString() || '')
      setStock(product.stock?.toString() || '')
      setDisponible(product.disponible ?? true)
      setImagenUrl(product.imagen_url || '')
      setSelectedCategories(
        (product.categories || []).map((c: any) => c.id)
      )
    }
  }, [product])

  const toggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) {
      setLocalError('Product name is required')
      return
    }
    if (!price || parseFloat(price) <= 0) {
      setLocalError('Product price must be greater than 0')
      return
    }
    if (!stock || parseInt(stock, 10) < 0) {
      setLocalError('Product stock cannot be negative')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        disponible,
        imagen_url: imagenUrl.trim() || null,
        category_ids: selectedCategories,
      })
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {(localError || error) && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {localError || error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description (optional)"
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price * (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock *
          </label>
          <input
            id="stock"
            type="number"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://example.com/image.jpg (optional)"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="disponible"
          type="checkbox"
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
          Available
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categories
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              {cat.name}
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-gray-400">No categories available</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}

export default ProductForm
