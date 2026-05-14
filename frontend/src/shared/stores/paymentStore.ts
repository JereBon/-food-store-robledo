import { create } from 'zustand'
import { http } from '@/shared/api/http'

type PaymentStatus = 'idle' | 'pending' | 'approved' | 'rejected'

type PaymentState = {
  status: PaymentStatus
  preferenceId: string | null
  initPoint: string | null
  isLoading: boolean
  error: string | null
  startCheckout: (pedidoId: number) => Promise<string>
  updatePaymentStatus: (status: PaymentStatus) => void
  resetPayment: () => void
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  status: 'idle',
  preferenceId: null,
  initPoint: null,
  isLoading: false,
  error: null,

  startCheckout: async (pedidoId) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await http.post<{ preference_id: string; init_point: string }>(
        '/pagos/crear-preferencia',
        { pedido_id: pedidoId }
      )
      set({
        status: 'pending',
        preferenceId: data.preference_id,
        initPoint: data.init_point,
        isLoading: false,
      })
      return data.init_point
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      const msg = axiosErr?.response?.data?.detail ?? 'Error al iniciar el pago'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  updatePaymentStatus: (status) => set({ status }),

  resetPayment: () =>
    set({ status: 'idle', preferenceId: null, initPoint: null, isLoading: false, error: null }),
}))
