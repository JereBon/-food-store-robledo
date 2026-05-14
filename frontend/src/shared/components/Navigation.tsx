import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/authStore'
import { useCartStore } from '@/shared/stores/cartStore'
import { useUiStore } from '@/shared/stores/uiStore'

export const Navigation: FC = () => {
  const { user, roles } = useAuthStore()
  const itemCount = useCartStore((s) => s.totalItems())
  const setCartOpen = useUiStore((s) => s.setCartOpen)
  const isAdmin = roles?.includes('ADMIN')
  const isStock = roles?.includes('STOCK')
  const isPedidos = roles?.includes('PEDIDOS')
  const showCatalogMgmt = isAdmin || isStock
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Desktop layout (lg+) ── */}
        <div className="hidden lg:flex items-center h-16 gap-2">
          {/* Left: Food Store */}
          <Link to="/" className="text-xl font-bold hover:text-gray-200 shrink-0">
            Food Store
          </Link>

          {/* Center: Nav links (flex-1 takes remaining space, centered) */}
          <div className="flex-1 flex justify-center gap-1 min-w-0">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Inicio</Link>
            <Link to="/catalog" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Catálogo</Link>
            {user && <Link to="/orders" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Mis Pedidos</Link>}
            {showCatalogMgmt && <Link to="/admin/categories" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Categorías</Link>}
            {showCatalogMgmt && <Link to="/admin/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Productos</Link>}
            {showCatalogMgmt && <Link to="/admin/ingredients" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Ingredientes</Link>}
            {isAdmin && <Link to="/admin/usuarios" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Usuarios</Link>}
            {isAdmin && <Link to="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">Dashboard</Link>}
          </div>

          {/* Right: Cart + User */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-md hover:bg-gray-700 transition-colors"
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
              <div className="flex items-center gap-3 pl-4 border-l border-gray-600">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{user.nombre} {user.apellido}</span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
                <button
                  onClick={() => useAuthStore.getState().clearSession()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-4 border-l border-gray-600">
                <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-bold transition-colors">Iniciar sesión</Link>
                <Link to="/register" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-bold transition-colors">Registrarse</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile layout (< lg) ── */}
        <div className="flex lg:hidden items-center justify-between h-16">
          {/* Left: Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Menu de navegacion"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Center: Food Store */}
          <Link to="/" className="text-xl font-bold hover:text-gray-200">
            Food Store
          </Link>

          {/* Right: Cart + user */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-md hover:bg-gray-700 transition-colors"
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
              <button
                onClick={() => useAuthStore.getState().clearSession()}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold transition-colors"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link to="/login" className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold transition-colors">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile drawer (left side) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-700 mt-14 flex justify-between items-center">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setMenuOpen(false)} className="p-1 rounded-md hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <MobileNavLink to="/" label="Inicio" onClick={closeMenu} />
          <MobileNavLink to="/catalog" label="Catalogo" onClick={closeMenu} />
          {user && <MobileNavLink to="/orders" label="Mis Pedidos" onClick={closeMenu} />}
          {(isAdmin || showCatalogMgmt) && <div className="border-t border-gray-700 my-2 pt-2"><p className="px-3 text-xs text-gray-400 uppercase tracking-wider">Administracion</p></div>}
          {isAdmin && <MobileNavLink to="/admin/dashboard" label="Dashboard" onClick={closeMenu} />}
          {isAdmin && <MobileNavLink to="/admin/usuarios" label="Usuarios" onClick={closeMenu} />}
          {showCatalogMgmt && <MobileNavLink to="/admin/products" label="Productos" onClick={closeMenu} />}
          {showCatalogMgmt && <MobileNavLink to="/admin/categories" label="Categorias" onClick={closeMenu} />}
          {showCatalogMgmt && <MobileNavLink to="/admin/ingredients" label="Ingredientes" onClick={closeMenu} />}
        </nav>
      </aside>
    </nav>
  )
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
    >
      {label}
    </Link>
  )
}

export default Navigation
