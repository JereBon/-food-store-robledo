import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/features/auth/ui/RegisterForm'
import { useAuthStore } from '@/shared/stores/authStore'

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

describe('RegisterForm', () => {
  beforeEach(() => {
    mockRegister.mockReset()
    useAuthStore.getState().clearSession()
  })

  it('submits form and stores tokens', async () => {
    mockRegister.mockResolvedValue({
      access_token: 'access',
      refresh_token: 'refresh',
      token_type: 'bearer',
    })

    renderForm()

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan')
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Perez')
    await userEvent.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'supersecreto')

    await userEvent.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(mockRegister).toHaveBeenCalledWith({
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@example.com',
      password: 'supersecreto',
    })
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access')
    expect(state.refreshToken).toBe('refresh')
  })
})
