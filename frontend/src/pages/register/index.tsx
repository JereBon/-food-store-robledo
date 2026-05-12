import { RegisterForm } from '@/features/auth/ui/RegisterForm'

export function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 p-6">
      <RegisterForm />
    </main>
  )
}
