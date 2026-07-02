"use client"

import { useApp } from "@/shared/context/AppContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SistemaLayoutClient({ 
  children,
  tenantData
}: { 
  children: React.ReactNode
  tenantData: any
}) {
  const { user, loading, sidebarCollapsed, setSidebarCollapsed, logout } = useApp()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  if (loading) {
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* 1. SIDEBAR */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${tenantData ? "bg-primary" : "bg-slate-900"} border-r border-slate-800 text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-30`}
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
                    href="/admin/planos"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                  >
                    <i className="ti ti-credit-card text-base" />
                    {!sidebarCollapsed && <span className="truncate">Planos SaaS</span>}
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
                      Configurações
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/cliente/configuracoes/fidelidade"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition duration-150"
                    >
                      <i className="ti ti-award text-base" />
                      {!sidebarCollapsed && <span className="truncate">Fidelidade</span>}
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

        {/* Toggle colapso da sidebar */}
        <div className="p-4 border-t border-slate-800">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition lg:hidden"
            >
              <i className="ti ti-menu-2 text-xl" />
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                <i className="ti ti-crown text-amber-500" />
                Painel Geral Admin
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                <i className="ti ti-building-store text-indigo-500" />
                Barbearia Modelo
              </div>
            )}
          </div>

          {/* Perfil Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 text-left focus:outline-none"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name ? user.name[0].toUpperCase() : "U"}
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
                      logout()
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none w-full h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
