import { RegisterForm } from '@/features/auth/ui/RegisterForm'

export function RegisterPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <p className="text-slate-600">
          Registrate para acceder al catálogo y gestionar tus pedidos.
        </p>
      </header>
      <RegisterForm />
    </main>
  )
}
