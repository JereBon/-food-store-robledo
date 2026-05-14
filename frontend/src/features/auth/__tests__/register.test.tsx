import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/features/auth/ui/RegisterForm'

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form with all fields', () => {
    const client = new QueryClient()
    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <RegisterForm />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Juan')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Pérez')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrarme/i })).toBeInTheDocument()
  })
})
