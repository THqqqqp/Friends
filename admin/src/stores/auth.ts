import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import { apiClient } from '@/services/http'

const TOKEN_KEY = 'alumni-admin-token'
const EXPIRES_KEY = 'alumni-admin-token-exp'

interface LoginPayload {
  account: string
  password: string
}

interface LoginResponse {
  token: string
  expiresIn: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string | null,
    expiresAt: null as number | null,
    loading: false,
    error: ''
  }),
  getters: {
    isAuthenticated: (state) => {
      if (!state.token) return false
      if (!state.expiresAt) return true
      return state.expiresAt > Date.now()
    }
  },
  actions: {
    async login(payload: LoginPayload) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
        this.setToken(data.token, data.expiresIn)
        return data
      } catch (error) {
        const message =
          (error as AxiosError<{ message?: string }>).response?.data?.message || '登录失败'
        this.error = message
        throw new Error(message)
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.expiresAt = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EXPIRES_KEY)
      }
    },
    setToken(token: string, expiresIn?: number) {
      this.token = token
      this.expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token)
        if (this.expiresAt) {
          localStorage.setItem(EXPIRES_KEY, String(this.expiresAt))
        } else {
          localStorage.removeItem(EXPIRES_KEY)
        }
      }
    },
    restore() {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem(TOKEN_KEY)
      const expiresAt = localStorage.getItem(EXPIRES_KEY)
      this.token = token
      this.expiresAt = expiresAt ? Number(expiresAt) : null
      if (this.expiresAt && this.expiresAt <= Date.now()) {
        this.logout()
      }
    }
  }
})
