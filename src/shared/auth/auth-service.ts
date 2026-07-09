import { http } from "@/shared/lib/http"
import type { ApiResponse } from "@/shared/types/api"

export interface AuthUser {
  id: string
  client_id?: string
  name: string
  email: string
  role: string // admin, owner, manager, professional, receptionist, ou "" (aguardando seleção)
  impersonating?: boolean
  needs_client_selection?: boolean
  photo_url?: string
}

export interface ClientMembership {
  link_id: string
  client_id: string
  client_name: string
  client_slug: string
  role: string
  status: string
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

  myClients(): Promise<ApiResponse<ClientMembership[]>> {
    return http.get<ClientMembership[]>("/auth/my-clients")
  },

  // Troca a barbearia ativa: o BFF sobrescreve o cookie bc_session com o novo token
  switchClient(clientId: string): Promise<ApiResponse<{ ok: true }>> {
    return http.post<{ ok: true }>("/auth/switch-client", { client_id: clientId })
  },

  // Admin impersonando volta para a sessão admin limpa (cookie sobrescrito no BFF)
  returnToAdmin(): Promise<ApiResponse<{ ok: true }>> {
    return http.post<{ ok: true }>("/auth/return-to-admin", {})
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
