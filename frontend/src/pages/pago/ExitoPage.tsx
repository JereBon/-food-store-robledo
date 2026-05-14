import { Link } from 'react-router-dom'

export function ExitoPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-green-700 mb-2">¡Pago aprobado!</h1>
      <p className="text-gray-600 mb-8">
        Tu pago fue procesado correctamente. En breve recibirás la confirmación de tu pedido.
      </p>
      <Link
        to="/orders"
        className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
      >
        Ver mis pedidos
      </Link>
    </main>
  )
}
