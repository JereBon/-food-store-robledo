export function ForbiddenPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">403</h1>
      <p className="mt-2 text-slate-600">No tenés permisos</p>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-slate-600">No encontrado</p>
    </main>
  )
}
