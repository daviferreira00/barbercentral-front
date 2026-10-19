"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { adminNavSections, clienteNavSections } from "@/shared/config/nav"
import { haptic } from "@/shared/lib/haptics"
import { useApp } from "@/shared/context/AppContext"
import { MobileDrawer } from "./MobileDrawer"
import { SplashScreen } from "./SplashScreen"
import { QuickTutorialModal } from "@/features/tutorials/components/QuickTutorialModal"
import { BookOpen, Clock, Zap, ArrowRight } from "lucide-react"
import { resolveImageUrl } from "@/shared/lib/utils"

interface MobileShellProps {
  children: React.ReactNode
  user: { name?: string; role?: string }
  tenantData: any
  onLogout: () => void
}

function isDarkColor(color?: string): boolean {
  if (!color) return false
  if (["solid_dark", "dark"].includes(color)) return true
  const hex = color.replace("#", "").trim()
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  }
  return false
}

// Shell da experiência mobile: header fixo + drawer lateral retraído por padrão
export function MobileShell({ children, user, tenantData, onLogout }: MobileShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const pathname = usePathname()
  const { myClients, user: sessionUser, setSelectorOpen, onboarding } = useApp()

  // Só oferece a troca quando há para onde trocar (2+ vínculos ou admin impersonando)
  const canSwitchClient = myClients.length > 1 || !!sessionUser?.impersonating
  const isAdmin = user.role === "admin"

  // Módulo de tutorial correspondente à tela atual
  const getModuleFromPath = (path?: string) => {
    if (!path) return "agenda"
    if (path.includes("/caixa")) return "caixa"
    if (path.includes("/profissionais")) return "profissionais"
    if (path.includes("/servicos")) return "servicos"
    if (path.includes("/whatsapp")) return "whatsapp"
    if (path.includes("/fidelidade")) return "fidelidade"
    if (path.includes("/estoque")) return "estoque"
    return "agenda"
  }
  const currentModule = getModuleFromPath(pathname)

  // Status de período grátis (Trial): apenas se o status for "trial" e o usuário não for assinante ativo ou admin
  const subscriptionStatus = onboarding?.subscription_status || sessionUser?.subscription_status
  const isTrial =
    !isAdmin &&
    subscriptionStatus === "trial" &&
    sessionUser?.subscription_status !== "active" &&
    onboarding?.subscription_status !== "active"
  const daysRemaining = onboarding?.days_remaining ?? 7

  const logoUrl = resolveImageUrl(
    tenantData && (tenantData.logo_url || tenantData.logo_central)
      ? tenantData.logo_url || tenantData.logo_central
      : "/logo/barbercentral-logo-horizontal-white.svg"
  )

  const isDarkBg =
    tenantData?.background_type === "solid_dark" ||
    tenantData?.background_type === "dark"

  const getUserRoleLabel = () => {
    if (isAdmin) return "Administrador"
    if (user.role === "professional" || user.role === "barber") return "Barbeiro / Profissional"
    if (user.role === "receptionist") return "Recepção"
    return "Dono da Barbearia"
  }

  return (
    <div
      className={`min-h-dvh font-sans ${isDarkBg ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"}`}
      style={{
        ["--mobile-header-height" as any]: isTrial ? "92px" : "56px",
      }}
    >
      {/* Header fixo com gradiente da marca */}
      <header
        className="fixed inset-x-0 top-0 z-40 text-white shadow-md"
        style={{
          background: isAdmin
            ? "linear-gradient(135deg, #0f172a, #020617)"
            : "linear-gradient(135deg, color-mix(in srgb, var(--color-primary, #1a1a1a) 92%, white), color-mix(in srgb, var(--color-primary, #1a1a1a) 70%, black))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="flex h-14 items-center gap-2.5 px-3">
          {/* Botão de Menu */}
          <button
            aria-label="Abrir menu"
            onClick={() => {
              haptic()
              setDrawerOpen(true)
            }}
            className="mobile-tap flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-xl transition active:scale-90 shrink-0"
          >
            <i className="ti ti-menu-2" />
          </button>

          {/* Logo da Barbearia */}
          <img src={logoUrl} alt="Logo" className="h-8 w-auto max-w-[40%] object-contain shrink-0" />

          {/* Ações à Direita */}
          <div className="ml-auto flex items-center gap-2">
            {/* Botão de Dúvidas / Passos */}
            {!isAdmin && (
              <button
                onClick={() => {
                  haptic()
                  setTutorialOpen(true)
                }}
                className="mobile-tap flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white transition text-xs font-semibold shadow-xs"
                title="Dúvidas e Passo a Passo"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px] font-bold">Passos</span>
              </button>
            )}

            {/* Avatar do Usuário */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 border border-white/30 text-sm font-extrabold overflow-hidden shrink-0">
              {sessionUser?.photo_url ? (
                <img
                  src={resolveImageUrl(sessionUser.photo_url)}
                  alt={user.name}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                user.name ? user.name[0].toUpperCase() : "U"
              )}
            </div>
          </div>
        </div>

        {/* Faixa Compacta e Elegante do Período de Testes */}
        {isTrial && (
          <div className="h-9 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 px-3 flex items-center justify-between text-[11px] font-semibold border-t border-amber-400/30 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="truncate text-slate-950">
                Teste Grátis:{" "}
                <strong className="font-extrabold">
                  {daysRemaining <= 0
                    ? "Expirado"
                    : daysRemaining === 1
                      ? "1 dia restante"
                      : `${daysRemaining} dias restantes`}
                </strong>
              </span>
            </div>
            <Link
              href="/cliente/configuracoes/plano"
              onClick={() => haptic()}
              className="ml-2 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-transform shadow-xs"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Contratar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </header>

      {/* Compensa a altura do header fixo (56px + 36px se faixa de trial estiver ativa) */}
      <div
        className={isTrial ? "h-[92px]" : "h-14"}
        style={{
          marginTop: "env(safe-area-inset-top)",
          height: isTrial ? "92px" : "56px",
        }}
      />

      <main className="px-4 py-4" style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}>
        {children}
      </main>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={isAdmin ? adminNavSections : clienteNavSections}
        userName={user.name}
        userRole={getUserRoleLabel()}
        tenantName={isAdmin ? "BarberCentral" : tenantData?.client_name || null}
        onLogout={onLogout}
        onSwitchClient={canSwitchClient ? () => setSelectorOpen(true) : undefined}
        variant={isAdmin ? "admin" : "tenant"}
      />

      {/* Modal de Passo a Passo / Dúvidas */}
      <QuickTutorialModal
        moduleId={currentModule}
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />

      <SplashScreen logoUrl={logoUrl} name={tenantData?.client_name} />
    </div>
  )
}

