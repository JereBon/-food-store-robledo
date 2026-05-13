import { useState } from 'react'
import type { IIngredientReadShort } from '@/entities/ingredient'

interface IngredientExclusionModalProps {
  ingredients: IIngredientReadShort[]
  onConfirm: (exclusions: number[]) => void
  onCancel: () => void
}

export function IngredientExclusionModal({
  ingredients,
  onConfirm,
  onCancel,
}: IngredientExclusionModalProps) {
  const [excluded, setExcluded] = useState<number[]>([])

  const toggle = (id: number) => {
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold mb-4">Customize Your Product</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select ingredients you want to remove:
        </p>
        <div className="space-y-2 mb-6">
          {ingredients.map((ing) => (
            <label
              key={ing.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={excluded.includes(ing.id)}
                  onChange={() => toggle(ing.id)}
                  disabled={!ing.es_removible}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{ing.nombre}</span>
              </div>
              {ing.es_alergeno && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Allergen
                </span>
              )}
              {!ing.es_removible && (
                <span className="text-xs text-gray-400">Required</span>
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(excluded)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add to Cart
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
