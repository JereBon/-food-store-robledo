import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockClearCart = vi.fn()
const mockUseCartStore = vi.fn()
vi.mock('@/shared/stores/cartStore', () => ({
  useCartStore: () => mockUseCartStore(),
}))

const mockUseAuthStore = vi.fn()
vi.mock('@/shared/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

const mockPlaceOrder = vi.fn()
const mockUseOrderStore = vi.fn()
vi.mock('@/shared/stores/orderStore', () => ({
  useOrderStore: () => mockUseOrderStore(),
}))

const mockStartCheckout = vi.fn()
const mockUsePaymentStore = vi.fn()
vi.mock('@/shared/stores/paymentStore', () => ({
  usePaymentStore: () => mockUsePaymentStore(),
}))

const mockFetchDirecciones = vi.fn()
const mockFetchDireccionesEliminadas = vi.fn()
vi.mock('@/features/checkout/api', () => ({
  fetchDirecciones: () => mockFetchDirecciones(),
  fetchDireccionesEliminadas: () => mockFetchDireccionesEliminadas(),
  createDireccion: vi.fn(),
  updateDireccion: vi.fn(),
  deleteDireccion: vi.fn(),
  setDireccionPredeterminada: vi.fn(),
  restoreDireccion: vi.fn(),
}))

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
vi.mock('@/shared/api/http', () => ({
  http: {
    get: (...args: unknown[]) => mockHttpGet(...args),
    post: (...args: unknown[]) => mockHttpPost(...args),
  },
}))

import { CheckoutPage } from '@/pages/checkout/CheckoutPage'

const cartItems = [
  { productId: 1, name: 'Pizza', price: 400, quantity: 2, exclusions: [], image_url: null },
]

const addresses = [
  {
    id: 10,
    usuario_id: 1,
    calle: 'Av. Colón',
    numero: '200',
    piso: null,
    ciudad: 'Córdoba',
    codigo_postal: '5000',
    es_predeterminada: true,
    created_at: '2024-01-01T00:00:00',
    deleted_at: null,
  },
]

const formasPago = [
  { id: 1, nombre: 'Tarjeta de crédito', activo: true },
  { id: 2, nombre: 'Tarjeta de débito', activo: true },
]

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({ accessToken: 'tok' })
    mockUseCartStore.mockReturnValue({
      items: cartItems,
      totalPrice: () => 800,
      clearCart: mockClearCart,
    })
    mockUseOrderStore.mockReturnValue({
      placeOrder: mockPlaceOrder,
      isLoading: false,
      error: null,
    })
    mockUsePaymentStore.mockReturnValue({
      startCheckout: mockStartCheckout,
    })
    mockFetchDirecciones.mockResolvedValue(addresses)
    mockFetchDireccionesEliminadas.mockResolvedValue([])
    mockHttpGet.mockResolvedValue({ data: formasPago })
  })

  it('renders address list, cart summary and forma_pago options after loading', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    )

    await screen.findByText(/Av. Colón/)
    expect(screen.getByText('Finalizar Compra')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    await screen.findByText(/Tarjeta de crédito/)
    expect(screen.getByText('Tarjeta de débito')).toBeInTheDocument()
  })

  it('returns null and redirects when cart is empty', () => {
    mockUseCartStore.mockReturnValue({
      items: [],
      totalPrice: () => 0,
      clearCart: mockClearCart,
    })

    const { container } = render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    )

    expect(container.firstChild).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/catalog', { replace: true })
  })

  it('on confirm calls placeOrder, clearCart, startCheckout and redirects to exito page', async () => {
    mockPlaceOrder.mockResolvedValueOnce({ id: 42 })
    mockStartCheckout.mockResolvedValueOnce('https://mp.com/pay/pref-x')

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    )

    await screen.findByText(/Av. Colón/)
    await screen.findByText(/Tarjeta de crédito/)

    fireEvent.click(screen.getByRole('button', { name: /confirmar pedido/i }))

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled()
      const payload = mockPlaceOrder.mock.calls[0][0]
      expect(payload.forma_pago_id).toBe(1)
      expect(mockClearCart).toHaveBeenCalled()
      expect(mockStartCheckout).toHaveBeenCalledWith(42)
      expect(mockNavigate).toHaveBeenCalledWith('/pago/exito?pedido=42')
    })
  })

  it('shows error inline when placeOrder fails', async () => {
    mockUseOrderStore.mockReturnValue({
      placeOrder: mockPlaceOrder,
      isLoading: false,
      error: 'Stock insuficiente para producto 1',
    })

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    )

    await screen.findByText(/Av. Colón/)
    expect(screen.getByText('Stock insuficiente para producto 1')).toBeInTheDocument()
  })
})
