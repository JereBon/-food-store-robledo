import { useMutation } from '@tanstack/react-query'

import type { RegisterPayload, RegisterResponse } from '@/features/auth/api/types'
import { register } from '@/features/auth/api/register'

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: (payload) => register(payload),
  })
}
