import { useState } from 'react'

import { useRegister } from '@/features/auth/model/useRegister'
import { useAuthStore } from '@/shared/stores/authStore'

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { mutateAsync, isPending } = useRegister()
  const setSession = useAuthStore((s) => s.setSession)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      const response = await mutateAsync({ nombre, apellido, email, password })
      setSession(response.access_token, response.refresh_token, ['CLIENT'])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setError(message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            className="rounded border border-slate-300 px-3 py-2"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Apellido
          <input
            className="rounded border border-slate-300 px-3 py-2"
            name="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        disabled={isPending}
      >
        {isPending ? 'Registrando...' : 'Registrarme'}
      </button>
    </form>
  )
}
