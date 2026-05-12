import { useMutation } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { useAuthStore } from '@/shared/stores/authStore'
import type { LoginPayload, AuthResponse } from './types'

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await http.post<AuthResponse>('/auth/login', payload)
      return data
    },
    onSuccess: (data) => {
      setSession(
        data.access_token,
        data.refresh_token,
        data.user.roles.map((r) => r.code as any),
        {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.nombre,
          apellido: data.user.apellido,
        }
      )
    },
  })
}
