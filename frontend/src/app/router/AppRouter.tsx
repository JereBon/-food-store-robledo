import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { ForbiddenPage, NotFoundPage } from '@/pages/errors'
import { CatalogPage, ProductDetailPage } from '@/pages/catalog'
import { CartPage } from '@/pages/cart'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { ProductListPage, ProductCreatePage, ProductEditPage } from '@/pages/admin/products'
import { IngredientListPage } from '@/pages/admin/ingredients'
import { CheckoutPage } from '@/pages/checkout/CheckoutPage'
import { OrdersPage } from '@/pages/orders/OrdersPage'
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'
import { ExitoPage } from '@/pages/pago/ExitoPage'
import { PendientePage } from '@/pages/pago/PendientePage'
import { FalloPage } from '@/pages/pago/FalloPage'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'
import { CartDrawer } from '@/shared/components/CartDrawer'

export function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/pago/exito" element={<ExitoPage />} />
        <Route path="/pago/pendiente" element={<PendientePage />} />
        <Route path="/pago/fallo" element={<FalloPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute roles={['ADMIN', 'STOCK']}>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute roles={['ADMIN', 'STOCK']}>
              <ProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN', 'STOCK']}>
              <ProductEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ingredients"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <IngredientListPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CartDrawer />
    </>
  )
}
