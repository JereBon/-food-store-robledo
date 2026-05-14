import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useOrderStore } from '@/shared/stores/orderStore'

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-blue-100 text-blue-800',
  EN_PREPARACION: 'bg-orange-100 text-orange-800',
  EN_CAMINO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export function OrdersPage() {
  const { myOrders, isLoading, fetchMyOrders } = useOrderStore()

  useEffect(() => {
    fetchMyOrders()
  }, [fetchMyOrders])

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500">Cargando pedidos...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

      {myOrders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aún no tienes pedidos.</p>
          <Link to="/catalog" className="text-green-600 hover:underline font-medium">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => {
            const statusKey = order.estado_nombre?.toUpperCase().replace(/ /g, '_') ?? ''
            const statusLabel = STATUS_LABELS[statusKey] ?? order.estado_nombre ?? String(order.estado_id)
            const statusColor = STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700'
            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div>
                  <p className="font-medium">Pedido #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                    {' · '}
                    {order.num_items} {order.num_items === 1 ? 'ítem' : 'ítems'}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                  <p className="text-sm font-bold mt-1">${Number(order.total).toFixed(2)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
