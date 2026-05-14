import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockFetchMyOrders = vi.fn()
const mockUseOrderStore = vi.fn()

vi.mock('@/shared/stores/orderStore', () => ({
  useOrderStore: () => mockUseOrderStore(),
}))

import { OrdersPage } from '@/pages/orders/OrdersPage'

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOrderStore.mockReturnValue({
      myOrders: [],
      isLoading: false,
      fetchMyOrders: mockFetchMyOrders,
    })
  })

  it('shows empty state when no orders', () => {
    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Aún no tienes pedidos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver catálogo/i })).toHaveAttribute('href', '/catalog')
  })

  it('renders list of orders with status badge and total', () => {
    mockUseOrderStore.mockReturnValue({
      myOrders: [
        {
          id: 7,
          estado_id: 1,
          estado_nombre: 'PENDIENTE',
          total: 1200,
          created_at: '2024-06-01T12:00:00',
          num_items: 3,
        },
      ],
      isLoading: false,
      fetchMyOrders: mockFetchMyOrders,
    })

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Pedido #7')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('$1200.00')).toBeInTheDocument()
    expect(screen.getByText(/3 ítems/)).toBeInTheDocument()
  })

  it('calls fetchMyOrders on mount', () => {
    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    )

    expect(mockFetchMyOrders).toHaveBeenCalledOnce()
  })
})
