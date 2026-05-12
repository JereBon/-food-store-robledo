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
            ? `¡Bienvenido de nuevo, ${user.nombre}! 👋` 
            : 'Tu tienda de alimentos favorita. Inicia sesión para gestionar el catálogo.'}
        </p>
      </div>
      
      {!user && (
        <div className="mt-10 flex justify-center">
          <div className="rounded-md shadow">
            <a
              href="/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Comenzar ahora
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
