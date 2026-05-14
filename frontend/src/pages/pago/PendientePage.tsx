import { Link } from 'react-router-dom'

export function PendientePage() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h1 className="text-2xl font-bold text-yellow-700 mb-2">Pago en proceso</h1>
      <p className="text-gray-600 mb-4">
        Tu pago está siendo revisado. Esto puede tardar unos minutos.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Te notificaremos cuando se confirme. Podés consultar el estado de tu pedido en cualquier momento.
      </p>
      <Link
        to="/orders"
        className="inline-block px-6 py-3 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors"
      >
        Ver mis pedidos
      </Link>
    </main>
  )
}
