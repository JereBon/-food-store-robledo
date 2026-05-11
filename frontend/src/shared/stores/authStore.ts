import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoleCode = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  roles: RoleCode[]
  setSession: (accessToken: string, refreshToken: string, roles: RoleCode[]) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      roles: [],
      setSession: (accessToken, refreshToken, roles) =>
        set({ accessToken, refreshToken, roles }),
      clearSession: () => set({ accessToken: null, refreshToken: null, roles: [] }),
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    },
  ),
)
