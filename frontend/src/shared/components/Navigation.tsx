import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/authStore'
import { useCartStore } from '@/shared/stores/cartStore'
import { useUiStore } from '@/shared/stores/uiStore'

export const Navigation: FC = () => {
  const { user, roles } = useAuthStore()
  const itemCount = useCartStore((s) => s.totalItems())
  const setCartOpen = useUiStore((s) => s.setCartOpen)
  const isAdmin = roles?.includes('ADMIN')

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold hover:text-gray-200">
            Food Store
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Catalog
            </Link>

            {isAdmin && (
              <Link
                to="/admin/categories"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Categories
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/products"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Products
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/ingredients"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Ingredients
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-600">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{user.nombre} {user.apellido}</span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
                <button
                  onClick={() => useAuthStore.getState().clearSession()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-600">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-bold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-bold transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
