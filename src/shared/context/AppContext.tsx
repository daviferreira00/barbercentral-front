"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService, type AuthUser } from "@/shared/auth/auth-service"

interface AppContextType {
  user: AuthUser | null
  loading: boolean
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
      if (!isPublicRoute) {
        router.push("/login")
      }
      setLoading(false)
      return
    }

    if (res.data) {
      setUser(res.data)
    }
    setLoading(false)
  }

  const logout = async () => {
    setLoading(true)
    await authService.logout()
    setUser(null)
    router.push("/login")
    setLoading(false)
  }

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
