import { create } from 'zustand'

type PaymentState = {
  status: 'idle' | 'pending' | 'approved' | 'rejected'
  setStatus: (status: PaymentState['status']) => void
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
}))
