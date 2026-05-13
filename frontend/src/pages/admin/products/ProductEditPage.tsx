import { useParams, useNavigate } from 'react-router-dom'
import { useProduct, useUpdateProduct, useSetProductIngredients } from '@/features/products/api'
import { ProductForm, IProductFormData } from '@/features/products/widgets/ProductForm'

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(id ? Number(id) : null)
  const updateMutation = useUpdateProduct()
  const setIngredientsMutation = useSetProductIngredients()

  const handleSubmit = async (data: IProductFormData) => {
    if (!id) return
    await updateMutation.mutateAsync({ id: Number(id), data })
    await setIngredientsMutation.mutateAsync({
      id: Number(id),
      ingredients: data.ingredient_selections,
    })
    navigate('/admin/products')
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>
  }

  if (!product) {
    return <div className="p-6 text-center text-gray-500">Product not found.</div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending || setIngredientsMutation.isPending}
        error={updateMutation.error?.message ?? setIngredientsMutation.error?.message}
      />
    </div>
  )
}
