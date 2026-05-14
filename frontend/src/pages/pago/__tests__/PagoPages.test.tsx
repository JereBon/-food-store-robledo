import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { ExitoPage } from '@/pages/pago/ExitoPage'
import { PendientePage } from '@/pages/pago/PendientePage'
import { FalloPage } from '@/pages/pago/FalloPage'

describe('ExitoPage', () => {
  it('renders approved message and link to orders', () => {
    render(<MemoryRouter><ExitoPage /></MemoryRouter>)
    expect(screen.getByText(/Pago aprobado/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver mis pedidos/i })
    expect(link).toHaveAttribute('href', '/orders')
  })
})

describe('PendientePage', () => {
  it('renders pending message and link to orders', () => {
    render(<MemoryRouter><PendientePage /></MemoryRouter>)
    expect(screen.getByText(/Pago en proceso/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver mis pedidos/i })
    expect(link).toHaveAttribute('href', '/orders')
  })
})

describe('FalloPage', () => {
  it('renders rejected message with retry and orders links', () => {
    render(<MemoryRouter><FalloPage /></MemoryRouter>)
    expect(screen.getByText(/Pago rechazado/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reintentar pago/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver mis pedidos/i })).toBeInTheDocument()
  })
})
