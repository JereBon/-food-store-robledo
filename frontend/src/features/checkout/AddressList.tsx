import type { DireccionEntrega } from './api'

type Props = {
  addresses: DireccionEntrega[]
  deletedAddresses?: DireccionEntrega[]
  selectedId: number | null
  onSelect: (id: number) => void
  onEdit: (address: DireccionEntrega) => void
  onDelete: (id: number) => void
  onSetDefault: (id: number) => void
  onRestore?: (id: number) => void
  showDeleted?: boolean
  onToggleShowDeleted?: () => void
}

export function AddressList({
  addresses,
  deletedAddresses = [],
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  onRestore,
  showDeleted = false,
  onToggleShowDeleted,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Active addresses */}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`relative border rounded-lg transition-colors ${
            selectedId === addr.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <label className="flex items-start gap-3 p-4 cursor-pointer">
            <input
              type="radio"
              name="direccion"
              value={addr.id}
              checked={selectedId === addr.id}
              onChange={() => onSelect(addr.id)}
              className="mt-1 accent-green-600"
            />
            <div className="flex-1">
              <p className="font-medium">
                {addr.calle} {addr.numero ?? ''}
                {addr.piso ? `, Piso ${addr.piso}` : ''}
              </p>
              <p className="text-sm text-gray-600">
                {addr.ciudad}
                {addr.codigo_postal ? ` (${addr.codigo_postal})` : ''}
              </p>
              {addr.es_predeterminada && (
                <span className="text-xs text-green-600 font-medium">Predeterminada</span>
              )}
            </div>
          </label>

          {/* Action buttons */}
          <div className="flex gap-1 px-4 pb-3 pl-12">
            <button
              type="button"
              onClick={() => onEdit(addr)}
              className="text-xs text-gray-600 hover:text-blue-600 underline"
            >
              Editar
            </button>
            <span className="text-xs text-gray-300">|</span>
            {!addr.es_predeterminada && (
              <>
                <button
                  type="button"
                  onClick={() => onSetDefault(addr.id)}
                  className="text-xs text-gray-600 hover:text-green-600 underline"
                >
                  Marcar predeterminada
                </button>
                <span className="text-xs text-gray-300">|</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onDelete(addr.id)}
              className="text-xs text-gray-600 hover:text-red-600 underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Deleted addresses section */}
      {deletedAddresses.length > 0 && onToggleShowDeleted && (
        <button
          type="button"
          onClick={onToggleShowDeleted}
          className="w-full text-xs text-gray-500 hover:text-gray-700 underline py-1"
        >
          {showDeleted
            ? 'Ocultar direcciones eliminadas'
            : `Ver direcciones eliminadas (${deletedAddresses.length})`}
        </button>
      )}

      {showDeleted && deletedAddresses.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-gray-400 font-medium px-1">Eliminadas</p>
          {deletedAddresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-dashed border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 line-through">
                    {addr.calle} {addr.numero ?? ''}
                    {addr.piso ? `, Piso ${addr.piso}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {addr.ciudad}
                    {addr.codigo_postal ? ` (${addr.codigo_postal})` : ''}
                  </p>
                </div>
                {onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(addr.id)}
                    className="text-xs text-green-600 hover:text-green-800 underline font-medium flex-shrink-0"
                  >
                    Recuperar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
