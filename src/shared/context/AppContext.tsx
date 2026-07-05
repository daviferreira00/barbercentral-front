"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService, type AuthUser, type ClientMembership } from "@/shared/auth/auth-service"
import { http } from "@/shared/lib/http"

interface AppContextType {
  user: AuthUser | null
  loading: boolean
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  // Multi-tenant
  myClients: ClientMembership[]
  activeClient: ClientMembership | null
  mustSelectClient: boolean
  selectorOpen: boolean
  setSelectorOpen: (open: boolean) => void
  switchClient: (clientId: string) => Promise<string | null>
  returnToAdmin: () => Promise<string | null>
  impersonate: (clientId: string) => Promise<string | null>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [myClients, setMyClients] = useState<ClientMembership[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Evita checagem de auth nas rotas públicas
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/esqueci-senha" ||
    pathname === "/criar-senha" ||
    pathname === "/magic-link"

  const refreshSession = async () => {
    if (isPublicRoute) {
      setLoading(false)
      return
    }

    const res = await authService.me()
    if (res.error) {
      setUser(null)
      setMyClients([])
      if (!isPublicRoute) {
        router.push("/login")
      }
      setLoading(false)
      return
    }

    if (res.data) {
      setUser(res.data)
      // Admin usa /admin/clients no seletor; usuário comum lista os vínculos dele
      if (res.data.role !== "admin" && !res.data.impersonating) {
        const clientsRes = await authService.myClients()
        setMyClients(clientsRes.data ?? [])
      } else {
        setMyClients([])
      }
    }
    setLoading(false)
  }

  const logout = async () => {
    setLoading(true)
    await authService.logout()
    setUser(null)
    setMyClients([])
    router.push("/login")
    setLoading(false)
  }

  // As três ações reemitem o JWT e sobrescrevem o cookie httpOnly no BFF;
  // navegação com reload completo para o layout server-side rebuscar o branding.
  // Retornam a mensagem de erro (ou null em sucesso) para a UI exibir.
  const switchClient = async (clientId: string): Promise<string | null> => {
    const res = await authService.switchClient(clientId)
    if (res.error) return res.error.message
    window.location.href = "/cliente"
    return null
  }

  const returnToAdmin = async (): Promise<string | null> => {
    const res = await authService.returnToAdmin()
    if (res.error) return res.error.message
    window.location.href = "/admin"
    return null
  }

  const impersonate = async (clientId: string): Promise<string | null> => {
    const res = await http.post<{ ok: true }>(`/admin/impersonate/${clientId}`)
    if (res.error) return res.error.message
    window.location.href = "/cliente"
    return null
  }

  const activeClient =
    (user?.client_id && myClients.find((c) => c.client_id === user.client_id)) || null

  const mustSelectClient = !!user?.needs_client_selection

  // Seleção obrigatória: força o seletor aberto até o usuário escolher
  useEffect(() => {
    if (mustSelectClient) {
      setSelectorOpen(true)
    }
  }, [mustSelectClient])

  useEffect(() => {
    refreshSession()
  }, [pathname])

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        sidebarCollapsed,
        setSidebarCollapsed,
        logout,
        refreshSession,
        myClients,
        activeClient,
        mustSelectClient,
        selectorOpen,
        setSelectorOpen,
        switchClient,
        returnToAdmin,
        impersonate,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
