import { create } from 'zustand'

type UiState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
}))
