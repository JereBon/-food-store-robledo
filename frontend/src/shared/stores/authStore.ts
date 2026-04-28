import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoleCode = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT'

type AuthState = {
  accessToken: string | null
  roles: RoleCode[]
  setSession: (accessToken: string, roles: RoleCode[]) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      roles: [],
      setSession: (accessToken, roles) => set({ accessToken, roles }),
      clearSession: () => set({ accessToken: null, roles: [] }),
    }),
    { name: 'foodstore-auth' },
  ),
)
