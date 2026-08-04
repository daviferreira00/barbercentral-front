"use client"

import { useApp } from "@/shared/context/AppContext"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { MobileShell } from "@/components/mobile/MobileShell"
import { EstablishmentSelectorModal } from "./EstablishmentSelectorModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { http } from "@/shared/lib/http"

export default function SistemaLayoutClient({ 
  children,
  tenantData
}: { 
  children: React.ReactNode
  tenantData: any
}) {
  const { user, loading, sidebarCollapsed, setSidebarCollapsed, logout, setSelectorOpen } = useApp()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user || user.role === "admin") return

    const fetchUnreadCount = async () => {
      const res = await http.get<any[]>("/cliente/chats")
      if (res.data && Array.isArray(res.data)) {
        const sum = res.data.reduce((acc, curr) => acc + (curr.unread_count || 0), 0)
        setUnreadCount(sum)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 8000)
    return () => clearInterval(interval)
  }, [user])



  if (loading || isMobile === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <span className="text-sm font-semibold text-slate-500">Carregando painel...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isAdmin = user.role === "admin"
  const isKds = pathname?.endsWith("/agenda/kds")

  if (isKds) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {children}
      </div>
    )
  }

  // Experiência mobile dedicada em formato de app
  if (isMobile) {
    return (
      <>
        <MobileShell user={user} tenantData={tenantData} onLogout={logout}>
          {children}
        </MobileShell>
        <EstablishmentSelectorModal />
      </>
    )
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Overlay (Mobile only, when open) */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* 1. SIDEBAR */}
      <aside
        className={`${
          sidebarCollapsed ? "hidden md:flex w-20" : "flex fixed md:static top-0 left-0 bottom-0 w-64 z-40 shadow-2xl md:shadow-none"
        } flex-col justify-between ${
          tenantData ? "bg-primary" : "bg-slate-900"
        } border-r border-slate-800 text-white transition-all duration-300 ease-in-out`}
        style={tenantData ? { backgroundColor: "var(--color-primary)" } : {}}
      >
        <div>
          {/* Header da Sidebar */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800 justify-center">
            <Link href={isAdmin ? "/admin" : "/cliente"} className="flex items-center min-w-0 justify-center w-full">
              {sidebarCollapsed ? (
                <img
                  src={tenantData && (tenantData.logo_central || tenantData.logo_url) ? (tenantData.logo_central || tenantData.logo_url) : "/logo/barbercentral-icon-white.svg"}
                  alt="Logo Icon"
                  className="h-8 w-auto max-w-[2rem] object-contain"
                />
              ) : (
                <img
                  src={tenantData && (tenantData.logo_url || tenantData.logo_central) ? (tenantData.logo_url || tenantData.logo_central) : "/logo/barbercentral-logo-horizontal-white.svg"}
                  alt="Logo"
                  className="max-h-12 w-auto max-w-[80%] object-contain"
                />
              )}
            </Link>
          </div>

          {/* Menus de Navegação */}
          <nav className="p-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
            {isAdmin ? (
              // Menu plataforma admin
              <div className="flex flex-col gap-1.5">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                    Plataforma
                  </span>
                )}
                <div className="flex flex-col gap-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-layout-dashboard text-base" />
                    {!sidebarCollapsed && <span className="truncate">Visão Geral</span>}
                  </Link>
                  <Link
                    href="/admin/clientes"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-building-store text-base" />
                    {!sidebarCollapsed && <span className="truncate">Barbearias</span>}
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-users text-base" />
                    {!sidebarCollapsed && <span className="truncate">Usuários</span>}
                  </Link>
                  <Link
                    href="/admin/planos"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-credit-card text-base" />
                    {!sidebarCollapsed && <span className="truncate">Planos SaaS</span>}
                  </Link>
                  <Link
                    href="/admin/whatsapp"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-brand-whatsapp text-base" />
                    {!sidebarCollapsed && <span className="truncate">Conexões WhatsApp</span>}
                  </Link>
                </div>
              </div>
            ) : (
              // Menu do cliente (barbearia)
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                      Operacional
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/cliente/agenda"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-calendar text-base" />
                      {!sidebarCollapsed && <span className="truncate">Agenda</span>}
                    </Link>
                    <Link
                      href="/cliente/profissionais"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-users text-base" />
                      {!sidebarCollapsed && <span className="truncate">Profissionais</span>}
                    </Link>
                    <Link
                      href="/cliente/servicos"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-cut text-base" />
                      {!sidebarCollapsed && <span className="truncate">Serviços</span>}
                    </Link>
                    <Link
                      href="/cliente/clientes"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-users-group text-base" />
                      {!sidebarCollapsed && <span className="truncate">Clientes CRM</span>}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                      Faturamento & Estoque
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/cliente/caixa"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-cash text-base" />
                      {!sidebarCollapsed && <span className="truncate">Fluxo de Caixa</span>}
                    </Link>
                    <Link
                      href="/cliente/estoque"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-box text-base" />
                      {!sidebarCollapsed && <span className="truncate">Estoque</span>}
                    </Link>
                    <Link
                      href="/cliente/relatorios"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-chart-bar text-base" />
                      {!sidebarCollapsed && <span className="truncate">Relatórios</span>}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                      Comunicação & Alertas
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/cliente/chat"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <i className="ti ti-message text-base" />
                        {!sidebarCollapsed && <span className="truncate">Chat WhatsApp</span>}
                      </div>
                      {!sidebarCollapsed && unreadCount > 0 && (
                        <span className="h-5 min-w-[20px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/cliente/whatsapp"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-brand-whatsapp text-base" />
                      {!sidebarCollapsed && <span className="truncate">Canais WhatsApp</span>}
                    </Link>
                    <Link
                      href="/cliente/notificacoes"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-bell text-base" />
                      {!sidebarCollapsed && <span className="truncate">Notificações</span>}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                      Configurações
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/cliente/configuracoes/agenda"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-calendar-event text-base" />
                      {!sidebarCollapsed && <span className="truncate">Regras da Agenda</span>}
                    </Link>
                    <Link
                      href="/cliente/configuracoes/fidelidade"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-award text-base" />
                      {!sidebarCollapsed && <span className="truncate">Fidelidade</span>}
                    </Link>
                    <Link
                      href="/cliente/configuracoes/identidade-visual"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-palette text-base" />
                      {!sidebarCollapsed && <span className="truncate">Identidade Visual</span>}
                    </Link>
                    <Link
                      href="/cliente/configuracoes/plano"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-shield-check text-base" />
                      {!sidebarCollapsed && <span className="truncate">Plano & Assinatura</span>}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Powered by + toggle colapso da sidebar */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1">
            {!sidebarCollapsed && (
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                Powered by
              </span>
            )}
            <img
              src={sidebarCollapsed ? "/logo/barbercentral-icon-white.svg" : "/logo/barbercentral-logo-horizontal-white.svg"}
              alt="Barber Central"
              className={`${sidebarCollapsed ? "h-6" : "h-5"} w-auto object-contain opacity-60`}
            />
          </div>
          <Button
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`ti ti-layout-sidebar-${sidebarCollapsed ? "right" : "left"} text-lg`} />
            {!sidebarCollapsed && <span className="ml-3 text-xs">Recolher menu</span>}
          </Button>
        </div>
      </aside>

      {/* 2. WORKSPACE DIREITA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-20">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition lg:hidden"
              >
                <i className="ti ti-menu-2 text-xl" />
              </button>
            )}

            {isAdmin ? (
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                title="Trocar de barbearia (Cmd+K)"
              >
                <i className="ti ti-crown text-amber-500" />
                Painel Geral Admin
                <i className="ti ti-chevron-down text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                title="Trocar de barbearia (Cmd+K)"
              >
                <i className="ti ti-building-store text-indigo-500" />
                <span className="truncate max-w-[160px]">{tenantData?.client_name || "Minha Barbearia"}</span>
                <i className="ti ti-chevron-down text-slate-400" />
              </button>
            )}

            {user.impersonating && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                <i className="ti ti-spy" />
                Sessão admin
              </div>
            )}
          </div>

          {/* Perfil Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 text-left focus:outline-none"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden border border-slate-200">
                {user.photo_url ? (
                  <img
                    src={user.photo_url.startsWith("/uploads") ? `http://localhost:8080${user.photo_url}` : user.photo_url}
                    alt={user.name}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  user.name ? user.name[0].toUpperCase() : "U"
                )}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-800 truncate leading-none">
                  {user.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-none">
                  {user.role === "admin" ? "Administrador" : "Dono da Barbearia"}
                </span>
              </div>
              <i className="ti ti-chevron-down text-slate-400 text-sm hidden md:inline" />
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-scale-up">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400">Logado como</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      router.push("/cliente/perfil")
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-750 hover:bg-slate-50 transition text-left"
                  >
                    <i className="ti ti-user text-base text-slate-400" />
                    Meu Perfil
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-650 hover:bg-red-50 transition text-left"
                  >
                    <i className="ti ti-logout text-base" />
                    Sair da conta
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content Area (Sem max-width!) */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scrollbar-none w-full">
          {children}
        </main>
      </div>

      <EstablishmentSelectorModal />
    </div>
  )
}
