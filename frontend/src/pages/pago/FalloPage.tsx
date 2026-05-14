import { Link } from 'react-router-dom'

export function FalloPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h1 className="text-2xl font-bold text-red-700 mb-2">Pago rechazado</h1>
      <p className="text-gray-600 mb-8">
        No se pudo procesar tu pago. Podés intentar nuevamente con otro método de pago o volver a tus pedidos.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <Link
          to="/checkout"
          className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
        >
          Reintentar pago
        </Link>
        <Link
          to="/orders"
          className="text-sm text-gray-500 hover:underline"
        >
          Ver mis pedidos
        </Link>
      </div>
    </main>
  )
}
