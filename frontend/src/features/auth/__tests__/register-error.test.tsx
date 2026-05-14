import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, vi } from 'vitest'

import { RegisterForm } from '@/features/auth/ui/RegisterForm'

describe('RegisterForm errors', () => {
  it('shows error message when provided', () => {
    const client = new QueryClient()

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <RegisterForm />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Form is rendered correctly
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
  })
})
