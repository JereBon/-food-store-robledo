import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoleCode = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT'

export type UserInfo = {
  id: number
  email: string
  nombre: string
  apellido: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  roles: RoleCode[]
  user: UserInfo | null
  setSession: (accessToken: string, refreshToken: string, roles: RoleCode[], user: UserInfo) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      roles: [],
      user: null,
      setSession: (accessToken, refreshToken, roles, user) =>
        set({ accessToken, refreshToken, roles, user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, roles: [], user: null }),
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        roles: state.roles,
        user: state.user
      }),
    },
  ),
)
