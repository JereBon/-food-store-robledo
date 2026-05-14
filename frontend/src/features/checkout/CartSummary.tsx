import type { CartItem } from '@/shared/stores/cartStore'

type Props = {
  items: CartItem[]
  totalPrice: number
}

export function CartSummary({ items, totalPrice }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.productId} className="flex justify-between items-start text-sm">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-gray-500">
              {item.quantity} × ${item.price.toFixed(2)}
            </p>
            {item.exclusions.length > 0 && (
              <p className="text-xs text-orange-600">Sin ingredientes excluidos</p>
            )}
          </div>
          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      ))}
      <div className="border-t pt-3 flex justify-between font-bold">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  )
}
