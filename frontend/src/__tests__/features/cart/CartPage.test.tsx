import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartPage } from '@/pages/cart/CartPage'
import { useCartStore } from '@/shared/stores/cartStore'

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  )
}

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('shows empty state with link to catalog when no items', () => {
    renderPage()
    expect(screen.getByText('Tu Carrito')).toBeInTheDocument()
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(screen.getByText('Ver Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Ver Catálogo').closest('a')).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('displays all items in the cart', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza Margarita',
          price: 8500,
          quantity: 2,
          exclusions: [],
        },
        {
          productId: 2,
          name: 'Hamburguesa Clásica',
          price: 6500,
          quantity: 1,
          exclusions: [3],
        },
      ],
    })
    renderPage()

    expect(screen.getByText('Pizza Margarita')).toBeInTheDocument()
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(screen.getByText(/Tu Carrito \(3 artículos\)/i)).toBeInTheDocument()
  })

  it('shows item count in header', () => {
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
    renderPage()

    expect(screen.getByText(/Tu Carrito \(3 artículos\)/i)).toBeInTheDocument()
  })

  it('displays item exclusions', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Hamburguesa',
          price: 10,
          quantity: 1,
          exclusions: [2, 5],
        },
      ],
    })
    renderPage()

    expect(screen.getByText(/Ingredientes excluidos: 2, 5/)).toBeInTheDocument()
  })

  it('shows subtotal per item (price x quantity)', () => {
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
    renderPage()

    expect(screen.getByText('$30.00 ARS')).toBeInTheDocument()
  })

  it('shows total price and item count in footer', () => {
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
    renderPage()

    // Total = 10*2 + 8*1 = 28
    expect(screen.getByText(/Total: \$28\.00 ARS/)).toBeInTheDocument()
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
    renderPage()

    const plusButtons = screen.getAllByText('+')
    fireEvent.click(plusButtons[0])

    expect(useCartStore.getState().items[0].quantity).toBe(2)
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
    renderPage()

    const minusButtons = screen.getAllByText('-')
    fireEvent.click(minusButtons[0])

    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('removes item when quantity goes to 0', () => {
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
    renderPage()

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
    renderPage()

    const removeButtons = screen.getAllByText('Eliminar')
    fireEvent.click(removeButtons[0])

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].name).toBe('Burger')
  })

  it('shows Vaciar Carrito button', () => {
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
    renderPage()

    expect(screen.getByText('Vaciar Carrito')).toBeInTheDocument()
  })

  it('shows confirmation modal when Vaciar Carrito is clicked', () => {
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
    renderPage()

    fireEvent.click(screen.getByText('Vaciar Carrito'))

    // "Vaciar Carrito" appears as both the button AND the modal title
    const clearCartElements = screen.getAllByText('Vaciar Carrito')
    expect(clearCartElements.length).toBe(2)
    expect(
      screen.getByText(/¿Estás seguro\? Esto eliminará los 2 artículos/),
    ).toBeInTheDocument()
    expect(screen.getByText('Sí, Vaciar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('removes all items when confirming clear', () => {
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
    renderPage()

    fireEvent.click(screen.getByText('Vaciar Carrito'))
    fireEvent.click(screen.getByText('Sí, Vaciar'))

    expect(useCartStore.getState().items).toHaveLength(0)
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })

  it('hides confirmation modal when Cancelar is clicked', () => {
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
    renderPage()

    fireEvent.click(screen.getByText('Vaciar Carrito'))
    fireEvent.click(screen.getByText('Cancelar'))

    // Modal should be hidden - the "Sí, Vaciar" button should no longer be visible
    expect(screen.queryByText('Sí, Vaciar')).not.toBeInTheDocument()
    // Items should still exist
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('disables Finalizar Compra button', () => {
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
    renderPage()

    const checkoutButton = screen.getByText('Finalizar Compra')
    expect(checkoutButton).toBeDisabled()
  })

  it('shows image when item has image_url', () => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          name: 'Pizza',
          price: 10,
          quantity: 1,
          exclusions: [],
          image_url: 'https://example.com/pizza.jpg',
        },
      ],
    })
    renderPage()

    const img = screen.getByAltText('Pizza')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/pizza.jpg')
  })

  it('shows price per item label', () => {
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
    renderPage()

    expect(screen.getByText('$10.50 ARS c/u')).toBeInTheDocument()
  })

  it('handles items without image_url gracefully', () => {
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
    renderPage()

    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not show Vaciar Carrito button when empty', () => {
    renderPage()
    expect(screen.queryByText('Vaciar Carrito')).not.toBeInTheDocument()
  })

  it('does not show Finalizar Compra when empty', () => {
    renderPage()
    expect(screen.queryByText('Finalizar Compra')).not.toBeInTheDocument()
  })
})
