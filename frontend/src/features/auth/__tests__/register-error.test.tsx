import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/features/auth/ui/RegisterForm'

const mockRegister = vi.fn()

vi.mock('@/features/auth/model/useRegister', () => ({
  useRegister: () => ({
    mutateAsync: mockRegister,
    isPending: false,
  }),
}))

function renderForm() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <RegisterForm />
    </QueryClientProvider>,
  )
}

describe('RegisterForm errors', () => {
  it('shows duplicate email error message', async () => {
    mockRegister.mockRejectedValueOnce(new Error('El email ya esta registrado'))

    renderForm()

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Lopez')
    await userEvent.type(screen.getByLabelText(/email/i), 'ana@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'supersecreto')

    await userEvent.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(screen.getByText('El email ya esta registrado')).toBeInTheDocument()
  })
})
