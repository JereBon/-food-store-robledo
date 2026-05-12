import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Navigation - sidebar/header navigation component
 */
export const Navigation: FC = () => {
  const { user, roles } = useAuthStore();
  const isAdmin = roles?.includes('ADMIN');

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home */}
          <Link to="/" className="text-xl font-bold hover:text-gray-200">
            Food Store
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Home
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

            {/* User Menu */}
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
              <div className="flex items-center space-x-2">
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
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
