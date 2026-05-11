import { http } from '@/shared/api/http'

import type { RegisterPayload, RegisterResponse } from './types'

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await http.post<RegisterResponse>('/auth/register', payload)
  return data
}
