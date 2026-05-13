import { useNavigate } from 'react-router-dom'
import { useCreateProduct, useSetProductIngredients } from '@/features/products/api'
import { ProductForm, IProductFormData } from '@/features/products/widgets/ProductForm'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()
  const setIngredientsMutation = useSetProductIngredients()

  const handleSubmit = async (data: IProductFormData) => {
    const product = await createMutation.mutateAsync(data)
    if (data.ingredient_selections.length > 0) {
      await setIngredientsMutation.mutateAsync({
        id: product.id,
        ingredients: data.ingredient_selections,
      })
    }
    navigate('/admin/products')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Product</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        error={createMutation.error?.message}
      />
    </div>
  )
}
