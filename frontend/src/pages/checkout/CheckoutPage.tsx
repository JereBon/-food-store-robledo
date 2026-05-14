import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/shared/stores/cartStore'
import { useAuthStore } from '@/shared/stores/authStore'
import { useOrderStore } from '@/shared/stores/orderStore'
import { usePaymentStore } from '@/shared/stores/paymentStore'
import { AddressList } from '@/features/checkout/AddressList'
import { AddressForm } from '@/features/checkout/AddressForm'
import { CartSummary } from '@/features/checkout/CartSummary'
import {
  fetchDirecciones,
  fetchDireccionesEliminadas,
  createDireccion,
  updateDireccion,
  deleteDireccion,
  setDireccionPredeterminada,
  restoreDireccion,
} from '@/features/checkout/api'
import { http } from '@/shared/api/http'
import type { DireccionEntrega } from '@/features/checkout/api'

type FormaPago = { id: number; nombre: string; activo: boolean }

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const { accessToken } = useAuthStore()

  const { placeOrder, isLoading, error } = useOrderStore()
  const { startCheckout } = usePaymentStore()

  const [addresses, setAddresses] = useState<DireccionEntrega[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<DireccionEntrega | null>(null)
  const [deletedAddresses, setDeletedAddresses] = useState<DireccionEntrega[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [selectedFormaPagoId, setSelectedFormaPagoId] = useState<number | null>(null)

  // Guards
  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true })
      return
    }
    if (items.length === 0) {
      navigate('/catalog', { replace: true })
      return
    }
    fetchDirecciones()
      .then((data) => {
        setAddresses(data)
        const def = data.find((a) => a.es_predeterminada)
        if (def) setSelectedAddressId(def.id)
        else if (data.length > 0) setSelectedAddressId(data[0].id)
        else setShowAddressForm(true)
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false))

    fetchDireccionesEliminadas()
      .then(setDeletedAddresses)
      .catch(() => {})

    http.get<FormaPago[]>('/pagos/formas-pago')
      .then((r) => {
        setFormasPago(r.data)
        if (r.data.length > 0) setSelectedFormaPagoId(r.data[0].id)
      })
      .catch(() => {})
  }, [accessToken, items.length, navigate])

  const handleSaveAddress = async (data: Parameters<typeof createDireccion>[0]) => {
    setSavingAddress(true)
    const addr = await createDireccion(data)
    setAddresses((prev) => [...prev, addr])
    setSelectedAddressId(addr.id)
    setShowAddressForm(false)
    setSavingAddress(false)
  }

  const handleEditAddress = (address: DireccionEntrega) => {
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  const handleUpdateAddress = async (data: Parameters<typeof createDireccion>[0]) => {
    if (!editingAddress) return
    setSavingAddress(true)
    const updated = await updateDireccion(editingAddress.id, data)
    setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setEditingAddress(null)
    setShowAddressForm(false)
    setSavingAddress(false)
  }

  const handleDeleteAddress = async (id: number) => {
    const deletedAddr = addresses.find((a) => a.id === id)
    await deleteDireccion(id)
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id)
      if (selectedAddressId === id) {
        const def = next.find((a) => a.es_predeterminada)
        if (def) setSelectedAddressId(def.id)
        else if (next.length > 0) setSelectedAddressId(next[0].id)
        else setSelectedAddressId(null)
      }
      return next
    })
    // Add to deleted list so the "Ver eliminadas" button reappears
    if (deletedAddr) {
      setDeletedAddresses((prev) => [...prev, { ...deletedAddr, deleted_at: new Date().toISOString() }])
    }
    // Also refresh from server to get accurate deleted_at
    fetchDireccionesEliminadas().then(setDeletedAddresses).catch(() => {})
  }

  const handleSetDefault = async (id: number) => {
    const updated = await setDireccionPredeterminada(id)
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        es_predeterminada: a.id === updated.id,
      }))
    )
  }

  const handleRestoreAddress = async (id: number) => {
    const restored = await restoreDireccion(id)
    setDeletedAddresses((prev) => prev.filter((a) => a.id !== id))
    setAddresses((prev) => [...prev, restored])
    setSelectedAddressId(restored.id)
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddress(null)
  }

  const handleConfirm = async () => {
    if (!selectedAddressId || !selectedFormaPagoId) return
    const payload = {
      direccion_id: selectedAddressId,
      forma_pago_id: selectedFormaPagoId,
      items: items.map((i) => ({
        producto_id: i.productId,
        cantidad: i.quantity,
        exclusiones: i.exclusions,
      })),
    }
    try {
      const order = await placeOrder(payload)
      clearCart()
      const initPoint = await startCheckout(order.id)
      window.location.href = initPoint
    } catch {
      // Error is already set in orderStore or paymentStore and displayed inline
    }
  }

  if (!accessToken || items.length === 0) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Address section */}
        <section>

          <h2 className="text-lg font-semibold mb-4">Dirección de entrega</h2>
          {loadingAddresses ? (
            <p className="text-gray-500">Cargando direcciones...</p>
          ) : (
            <>
              {addresses.length > 0 && (
                <AddressList
                  addresses={addresses}
                  deletedAddresses={deletedAddresses}
                  selectedId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                  onRestore={handleRestoreAddress}
                  showDeleted={showDeleted}
                  onToggleShowDeleted={() => setShowDeleted((v) => !v)}
                />
              )}
              {showAddressForm ? (
                <div className="mt-4">
                  <AddressForm
                    onSave={editingAddress ? handleUpdateAddress : handleSaveAddress}
                    onCancel={addresses.length > 0 ? handleCancelAddressForm : undefined}
                    loading={savingAddress}
                    initial={editingAddress}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-3 text-sm text-green-600 hover:underline"
                >
                  + Agregar nueva dirección
                </button>
              )}
            </>
          )}
        </section>

        {/* Order summary */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
          <div className="bg-gray-50 border rounded-lg p-4">
            <CartSummary items={items} totalPrice={totalPrice()} />
          </div>

          {/* Forma de pago */}
          {formasPago.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-semibold mb-2">Forma de pago</h3>
              <div className="space-y-2">
                {formasPago.map((fp) => (
                  <label key={fp.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="forma_pago"
                      value={fp.id}
                      checked={selectedFormaPagoId === fp.id}
                      onChange={() => setSelectedFormaPagoId(fp.id)}
                      className="accent-green-600"
                    />
                    <span className="text-sm">{fp.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedAddressId || !selectedFormaPagoId || isLoading}
            className="mt-6 w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="mt-3 w-full py-2 text-sm text-gray-600 hover:underline"
          >
            ← Volver al carrito
          </button>
        </section>
      </div>
    </main>
  )
}
