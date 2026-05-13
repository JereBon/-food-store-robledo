import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { ForbiddenPage, NotFoundPage } from '@/pages/errors'
import { CatalogPage, ProductDetailPage } from '@/pages/catalog'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { ProductListPage, ProductCreatePage, ProductEditPage } from '@/pages/admin/products'
import { IngredientListPage } from '@/pages/admin/ingredients'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/catalog/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']}>
            <ProductListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']}>
            <ProductCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedRoute requiredRoles={['ADMIN', 'STOCK']}>
            <ProductEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ingredients"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <IngredientListPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
