import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  useMetricasResumen,
  useVentasSeries,
  useTopProductos,
} from '@/features/admin/api'

type Granularidad = 'dia' | 'semana' | 'mes'

function todayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function thirtyDaysAgoISO() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

function formatPeriodo(periodo: string, granularidad: Granularidad): string {
  const d = new Date(periodo)
  if (granularidad === 'mes') {
    return d.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
  }
  if (granularidad === 'semana') {
    return `Sem ${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('es-AR', { month: 'short' })}`
  }
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

function Card({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
      </p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)
}

export function DashboardPage() {
  const [desde, setDesde] = useState(thirtyDaysAgoISO)
  const [hasta, setHasta] = useState(todayISO)
  const [granularidad, setGranularidad] = useState<Granularidad>('dia')

  const { data: resumen, isLoading: loadingResumen } = useMetricasResumen(
    { desde, hasta }
  )
  const { data: ventas, isLoading: loadingVentas } = useVentasSeries(
    { desde, hasta, granularidad }
  )
  const { data: topProductos, isLoading: loadingTop } = useTopProductos(
    { desde, hasta, limite: 10 }
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Date range filter */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary cards */}
      {loadingResumen ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            title="Ventas totales"
            value={formatCurrency(resumen?.total_ventas ?? 0)}
            subtitle="Pedidos entregados"
          />
          <Card
            title="Pedidos"
            value={resumen?.total_pedidos ?? 0}
            subtitle={`${resumen?.pedidos_por_estado?.length ?? 0} estados diferentes`}
          />
          <Card
            title="Usuarios registrados"
            value={resumen?.total_usuarios ?? 0}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales evolution chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de ventas</h2>
            <div className="flex gap-1">
              {(['dia', 'semana', 'mes'] as Granularidad[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularidad(g)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    granularidad === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g === 'dia' ? 'Día' : g === 'semana' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          {loadingVentas ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
              <span className="text-sm text-gray-400">Cargando...</span>
            </div>
          ) : ventas?.items && ventas.items.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={ventas.items.map((item) => ({
                  ...item,
                  periodoLabel: formatPeriodo(item.periodo, granularidad),
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="periodoLabel"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name: string) => {
                    if (name === 'monto') return [formatCurrency(Number(value)), 'Monto']
                    return [Number(value), 'Cantidad']
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monto"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="monto"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="cantidad"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <p className="text-sm text-gray-400">No hay datos de ventas para el período seleccionado</p>
            </div>
          )}
        </div>

        {/* Top products chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 productos</h2>
          {loadingTop ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
              <span className="text-sm text-gray-400">Cargando...</span>
            </div>
          ) : topProductos?.items && topProductos.items.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topProductos.items.map((item) => ({
                  ...item,
                  nombreLabel:
                    item.nombre.length > 18
                      ? item.nombre.substring(0, 16) + '...'
                      : item.nombre,
                  nombreCompleto: item.nombre,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="nombreLabel"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  formatter={(value, name: string, props) => {
                    if (name === 'total_unidades') return [Number(value), 'Unidades vendidas']
                    return [Number(value), name]
                  }}
                  labelFormatter={(label: string, payload: unknown[]) => {
                    const item = Array.isArray(payload) && payload.length > 0
                      ? (payload[0] as { payload?: { nombreCompleto?: string } })?.payload
                      : null
                    return item?.nombreCompleto || label
                  }}
                />
                <Bar dataKey="total_unidades" fill="#2563eb" radius={[0, 4, 4, 0]} name="total_unidades" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <p className="text-sm text-gray-400">No hay datos de productos para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
