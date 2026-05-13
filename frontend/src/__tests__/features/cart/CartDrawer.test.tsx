import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartDrawer } from '@/shared/components/CartDrawer'
import { useCartStore } from '@/shared/stores/cartStore'
import { useUiStore } from '@/shared/stores/uiStore'

function renderDrawer() {
  return render(
    <MemoryRouter>
      <CartDrawer />
    </MemoryRouter>,
  )
}

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
    useUiStore.setState({ cartOpen: false })
  })

  it('does not render when cart is closed', () => {
    useUiStore.setState({ cartOpen: false })
    const { container } = renderDrawer()
    const panel = container.querySelector('.translate-x-full')
    expect(panel).toBeInTheDocument()
  })

  it('renders when cart is open', () => {
    useUiStore.setState({ cartOpen: true })
    renderDrawer()
    expect(screen.getByText(/Carrito \(0 artículos\)/i)).toBeInTheDocument()
  })

  it('shows empty state with link to catalog', () => {
    useUiStore.setState({ cartOpen: true })
    renderDrawer()
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByText('Ver catálogo')).toBeInTheDocument()
    expect(screen.getByText('Ver catálogo').closest('a')).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('does not show total section when cart is empty', () => {
    useUiStore.setState({ cartOpen: true })
    renderDrawer()
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText('Ver Carrito')).not.toBeInTheDocument()
  })

  it('displays items in the cart', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 2,
          exclusions: [],
        },
        {
          productId: 2,
          name: 'Burger',
          price: 8,
          quantity: 1,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText(/Carrito \(3 artículos\)/i)).toBeInTheDocument()
  })

  it('displays item exclusions', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Burger',
          price: 8,
          quantity: 1,
          exclusions: [2, 5],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    expect(screen.getByText(/Sin: 2, 5/)).toBeInTheDocument()
  })

  it('shows subtotal per item', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 3,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    // 10 * 3 = 30 — appears both as item subtotal and total in footer
    expect(screen.getAllByText('$30.00 ARS').length).toBe(2)
  })

  it('shows total price and View Cart button when items exist', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 2,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText('$20.00 ARS').length).toBe(2)
    expect(screen.getByText('Ver Carrito')).toBeInTheDocument()
    expect(screen.getByText('Ver Carrito').closest('a')).toHaveAttribute(
      'href',
      '/cart',
    )
  })

  it('increases quantity when + is clicked', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 1,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const plusButtons = screen.getAllByText('+')
    fireEvent.click(plusButtons[0])

    const item = useCartStore.getState().items[0]
    expect(item.quantity).toBe(2)
  })

  it('decreases quantity when - is clicked', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 3,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const minusButtons = screen.getAllByText('-')
    fireEvent.click(minusButtons[0])

    const item = useCartStore.getState().items[0]
    expect(item.quantity).toBe(2)
  })

  it('removes item when quantity reaches 0 on decrement', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 1,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const minusButtons = screen.getAllByText('-')
    fireEvent.click(minusButtons[0])

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes item when Eliminar is clicked', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 1,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const removeButtons = screen.getAllByText('Eliminar')
    fireEvent.click(removeButtons[0])

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('closes drawer when overlay is clicked', () => {
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const overlay = document.querySelector('.fixed.inset-0')
    expect(overlay).toBeInTheDocument()

    if (overlay) {
      fireEvent.click(overlay)
    }

    expect(useUiStore.getState().cartOpen).toBe(false)
  })

  it('closes drawer when close button is clicked', () => {
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    const closeButton = screen.getByText('\u00D7')
    fireEvent.click(closeButton)

    expect(useUiStore.getState().cartOpen).toBe(false)
  })

  it('shows price per item', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10.5,
          quantity: 1,
          exclusions: [],
        },
      ],
    })
    useUiStore.setState({ cartOpen: true })
    renderDrawer()

    expect(screen.getByText('$10.50 ARS c/u')).toBeInTheDocument()
  })
})
