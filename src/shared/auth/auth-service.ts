import { http } from "@/shared/lib/http"
import type { ApiResponse } from "@/shared/types/api"

export interface AuthUser {
  id: string
  client_id?: string
  name: string
  email: string
  role: string // admin, owner, manager, professional, receptionist
}

export interface LoginCredentials {
  email: string
  password?: string
}

export const authService = {
  login(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    return http.post<AuthUser>("/auth/login", credentials)
  },

  logout(): Promise<ApiResponse<{ ok: true }>> {
    return http.post<{ ok: true }>("/auth/logout", {})
  },

  me(): Promise<ApiResponse<AuthUser>> {
    return http.get<AuthUser>("/auth/me")
  },

  requestPasswordReset(email: string): Promise<ApiResponse<{ ok: boolean }>> {
    return http.post<{ ok: boolean }>("/auth/password-reset", { email })
  },

  resetPassword(token: string, password: string): Promise<ApiResponse<{ ok: boolean }>> {
    return http.post<{ ok: boolean }>("/auth/password-reset/confirm", { token, password })
  },

  requestMagicLink(email: string): Promise<ApiResponse<{ ok: boolean }>> {
    return http.post<{ ok: boolean }>("/auth/magic-link", { email })
  },

  verifyMagicLink(token: string): Promise<ApiResponse<AuthUser>> {
    return http.post<AuthUser>("/auth/magic-link/verify", { token })
  },
}
