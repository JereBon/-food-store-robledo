import { vi, describe, it, expect, beforeEach } from 'vitest'
import { usePaymentStore } from '@/shared/stores/paymentStore'

vi.mock('@/shared/api/http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { http } from '@/shared/api/http'

describe('paymentStore', () => {
  beforeEach(() => {
    usePaymentStore.getState().resetPayment()
    vi.clearAllMocks()
  })

  it('startCheckout success sets preferenceId, initPoint and status pending', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({
      data: { preference_id: 'pref-123', init_point: 'https://mp.com/pay/pref-123' },
    })

    const initPoint = await usePaymentStore.getState().startCheckout(1)

    expect(initPoint).toBe('https://mp.com/pay/pref-123')
    expect(usePaymentStore.getState().preferenceId).toBe('pref-123')
    expect(usePaymentStore.getState().initPoint).toBe('https://mp.com/pay/pref-123')
    expect(usePaymentStore.getState().status).toBe('pending')
    expect(usePaymentStore.getState().isLoading).toBe(false)
    expect(usePaymentStore.getState().error).toBeNull()
  })

  it('startCheckout failure sets error and keeps status idle', async () => {
    const apiError = {
      response: { data: { detail: 'El pedido no está en estado PENDIENTE' } },
    }
    vi.mocked(http.post).mockRejectedValueOnce(apiError)

    await expect(usePaymentStore.getState().startCheckout(1)).rejects.toBeDefined()

    expect(usePaymentStore.getState().error).toBe('El pedido no está en estado PENDIENTE')
    expect(usePaymentStore.getState().isLoading).toBe(false)
    expect(usePaymentStore.getState().preferenceId).toBeNull()
  })

  it('updatePaymentStatus updates status', () => {
    usePaymentStore.getState().updatePaymentStatus('approved')
    expect(usePaymentStore.getState().status).toBe('approved')
  })

  it('resetPayment clears all state', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({
      data: { preference_id: 'pref-x', init_point: 'https://mp.com/x' },
    })
    await usePaymentStore.getState().startCheckout(1)

    usePaymentStore.getState().resetPayment()

    const state = usePaymentStore.getState()
    expect(state.status).toBe('idle')
    expect(state.preferenceId).toBeNull()
    expect(state.initPoint).toBeNull()
    expect(state.error).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('store is not persisted (no localStorage keys)', () => {
    expect(usePaymentStore.persist).toBeUndefined()
  })
})
