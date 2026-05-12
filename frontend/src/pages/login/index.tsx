import { LoginForm } from '@/features/auth/ui/LoginForm'

export function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 p-6">
      <LoginForm />
    </main>
  )
}
