import { useState, useEffect } from 'react'
import type { DireccionCreate, DireccionEntrega } from './api'

type Props = {
  onSave: (data: DireccionCreate) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  initial?: DireccionEntrega | null
}

export function AddressForm({ onSave, onCancel, loading, initial }: Props) {
  const [form, setForm] = useState<DireccionCreate>({ calle: '', ciudad: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        calle: initial.calle,
        numero: initial.numero ?? undefined,
        piso: initial.piso ?? undefined,
        ciudad: initial.ciudad,
        codigo_postal: initial.codigo_postal ?? undefined,
      })
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.calle.trim() || !form.ciudad.trim()) {
      setError('Calle y ciudad son obligatorios')
      return
    }
    setError(null)
    await onSave(form)
  }

  const set = (key: keyof DireccionCreate, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const title = initial ? 'Editar dirección' : 'Nueva dirección'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="font-medium text-gray-800">{title}</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Calle *</label>
          <input
            type="text"
            value={form.calle}
            onChange={(e) => set('calle', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            placeholder="Av. Siempre Viva"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input
            type="text"
            value={form.numero ?? ''}
            onChange={(e) => set('numero', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            placeholder="742"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Piso / Depto</label>
          <input
            type="text"
            value={form.piso ?? ''}
            onChange={(e) => set('piso', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            placeholder="3° B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
          <input
            type="text"
            value={form.ciudad}
            onChange={(e) => set('ciudad', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            placeholder="Buenos Aires"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
          <input
            type="text"
            value={form.codigo_postal ?? ''}
            onChange={(e) => set('codigo_postal', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            placeholder="1234"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : initial ? 'Actualizar dirección' : 'Guardar dirección'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
