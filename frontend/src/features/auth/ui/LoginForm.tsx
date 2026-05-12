import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLogin } from '../api/login'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const { mutateAsync, isPending } = useLogin()

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await mutateAsync({ email, password })
      navigate(from, { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Credenciales inválidas'
      setError(message)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Bienvenido</h2>
        <p className="mt-2 text-sm text-slate-600">Ingresa a tu cuenta de Food Store</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
          ) : 'Iniciar Sesión'}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-slate-600">¿No tienes cuenta? </span>
          <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  )
}
