import axios, { type AxiosRequestHeaders } from 'axios'
import type { useAuthStore } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiBaseUrl = baseURL

export const apiClient = axios.create({
  baseURL,
  timeout: 120000
})

type AuthStore = ReturnType<typeof useAuthStore>

let authStore: AuthStore | null = null

export function attachAuthStore(store: AuthStore) {
  authStore = store
}

apiClient.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders
  }
  if (authStore?.token) {
    const headers = config.headers as Record<string, string>
    headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && authStore?.isAuthenticated) {
      authStore.logout()
    }
    return Promise.reject(error)
  }
)
