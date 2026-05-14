import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/authStore'

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
          Food <span className="text-blue-600">Store</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {user
            ? `Bienvenido de nuevo, ${user.nombre}!`
            : 'La mejor comida al mejor precio.'}
        </p>
      </div>

      {!user ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-600 mb-8">
            Iniciá sesión o registrate para comprar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-lg transition-colors shadow-md"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md text-lg transition-colors shadow-md"
            >
              Registrarse
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-600 mb-8">
            ¿Que querés hacer hoy?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-lg transition-colors shadow-md"
            >
              Ver Catálogo
            </Link>
            <Link
              to="/orders"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-lg transition-colors shadow-md"
            >
              Mis Pedidos
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
