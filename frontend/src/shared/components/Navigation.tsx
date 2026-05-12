import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Navigation - sidebar/header navigation component
 */
export const Navigation: FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => r.code === 'ADMIN');

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
            {user && (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-600">
                <span className="text-sm">{user.email}</span>
                {user.roles && user.roles.length > 0 && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {user.roles.map(r => r.code).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
