import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { ForbiddenPage, NotFoundPage } from '@/pages/errors'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
