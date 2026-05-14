import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOrderStore } from '@/shared/stores/orderStore'
import type { Order } from '@/shared/stores/orderStore'

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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { fetchOrder, isLoading } = useOrderStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchOrder(Number(id))
      .then(setOrder)
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 403) setForbidden(true)
        else setNotFound(true)
      })
  }, [id, fetchOrder])

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">Cargando pedido...</p>
      </main>
    )
  }

  if (forbidden) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">No tienes permiso para ver este pedido.</p>
        <Link to="/orders" className="text-green-600 hover:underline">← Mis Pedidos</Link>
      </main>
    )
  }

  if (notFound || !order) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Pedido no encontrado.</p>
        <Link to="/orders" className="text-green-600 hover:underline">← Mis Pedidos</Link>
      </main>
    )
  }

  const statusKey = order.estado_nombre?.toUpperCase().replace(/ /g, '_') ?? ''
  const statusLabel = STATUS_LABELS[statusKey] ?? order.estado_nombre ?? String(order.estado_id)
  const statusColor = STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700'

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/orders" className="text-sm text-gray-500 hover:underline">
            ← Mis Pedidos
          </Link>
          <h1 className="text-2xl font-bold mt-1">Pedido #{order.id}</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {new Date(order.created_at).toLocaleDateString('es-AR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>

      {/* Address snapshot */}
      <section className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h2 className="font-semibold mb-2">Dirección de entrega</h2>
        <p className="text-sm text-gray-700">
          {order.direccion_calle} {order.direccion_numero ?? ''}
          {order.direccion_piso ? `, Piso ${order.direccion_piso}` : ''}
        </p>
        <p className="text-sm text-gray-700">
          {order.direccion_ciudad}
          {order.direccion_codigo_postal ? ` (${order.direccion_codigo_postal})` : ''}
        </p>
      </section>

      {/* Items */}
      <section className="mb-6">
        <h2 className="font-semibold mb-3">Productos</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-sm border-b pb-3">
              {item.imagen_url && (
                <img
                  src={item.imagen_url}
                  alt={item.producto_nombre}
                  className="w-14 h-14 object-cover rounded border flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.producto_nombre || `Producto #${item.producto_id}`}</p>
                <p className="text-gray-500">
                  {item.cantidad} × ${Number(item.precio_unitario).toFixed(2)}
                </p>
                {item.exclusiones.length > 0 && (
                  <p className="text-xs text-orange-600">
                    Exclusiones: {item.exclusiones.join(', ')}
                  </p>
                )}
              </div>
              <p className="font-medium flex-shrink-0">${Number(item.subtotal).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <section className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Envío</span>
          <span>${Number(order.costo_envio).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </section>
    </main>
  )
}
