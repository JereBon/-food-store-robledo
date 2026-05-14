import axios from 'axios'

import { env } from '@/shared/config/env'
import { useAuthStore } from '@/shared/stores/authStore'

export const http = axios.create({
  baseURL: env.apiUrl,
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handler: clear session and redirect to login
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const authStore = useAuthStore.getState()
      if (authStore.accessToken) {
        authStore.clearSession()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
