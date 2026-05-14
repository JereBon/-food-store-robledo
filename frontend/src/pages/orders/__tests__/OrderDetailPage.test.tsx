import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockFetchOrder = vi.fn()
const mockUseOrderStore = vi.fn()

vi.mock('@/shared/stores/orderStore', () => ({
  useOrderStore: () => mockUseOrderStore(),
}))

import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'

const mockOrder = {
  id: 5,
  usuario_id: 1,
  estado_id: 1,
  estado_nombre: 'PENDIENTE',
  total: 800,
  costo_envio: 50,
  direccion_calle: 'Calle Falsa',
  direccion_numero: '123',
  direccion_piso: null,
  direccion_ciudad: 'Córdoba',
  direccion_codigo_postal: '5000',
  created_at: '2024-06-15T10:00:00',
  items: [
    {
      id: 1,
      producto_id: 3,
      cantidad: 2,
      precio_unitario: 375,
      subtotal: 750,
      exclusiones: [],
    },
  ],
}

function renderDetail(id = '5') {
  return render(
    <MemoryRouter initialEntries={[`/orders/${id}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders" element={<div>Mis Pedidos</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOrderStore.mockReturnValue({
      fetchOrder: mockFetchOrder,
      isLoading: false,
    })
  })

  it('renders order detail after successful fetch', async () => {
    mockFetchOrder.mockResolvedValueOnce(mockOrder)

    renderDetail()

    await waitFor(() => {
      expect(screen.getByText('Pedido #5')).toBeInTheDocument()
    })

    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText(/Calle Falsa/)).toBeInTheDocument()
    expect(screen.getByText(/Córdoba/)).toBeInTheDocument()
    expect(screen.getByText('$800.00')).toBeInTheDocument()
  })

  it('shows forbidden message on 403 error', async () => {
    mockFetchOrder.mockRejectedValueOnce({ response: { status: 403 } })

    renderDetail()

    await waitFor(() => {
      expect(screen.getByText(/no tienes permiso/i)).toBeInTheDocument()
    })
  })

  it('shows not-found message for unknown order', async () => {
    mockFetchOrder.mockRejectedValueOnce({ response: { status: 404 } })

    renderDetail('999')

    await waitFor(() => {
      expect(screen.getByText(/pedido no encontrado/i)).toBeInTheDocument()
    })
  })
})
