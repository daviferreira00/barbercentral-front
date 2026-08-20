"use client"

import { useState } from "react"
import Link from "next/link"
import { adminNavSections, clienteNavSections } from "@/shared/config/nav"
import { haptic } from "@/shared/lib/haptics"
import { useApp } from "@/shared/context/AppContext"
import { MobileDrawer } from "./MobileDrawer"
import { SplashScreen } from "./SplashScreen"

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
  const { myClients, user: sessionUser, setSelectorOpen } = useApp()

  // Só oferece a troca quando há para onde trocar (2+ vínculos ou admin impersonando)
  const canSwitchClient = myClients.length > 1 || !!sessionUser?.impersonating
  const isAdmin = user.role === "admin"

  const logoUrl =
    tenantData && (tenantData.logo_url || tenantData.logo_central)
      ? tenantData.logo_url || tenantData.logo_central
      : "/logo/barbercentral-logo-horizontal-white.svg"

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
    <div className={`min-h-dvh font-sans ${isDarkBg ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"}`}>
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
        <div className="flex h-14 items-center gap-3 px-3">
          <button
            aria-label="Abrir menu"
            onClick={() => {
              haptic()
              setDrawerOpen(true)
            }}
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-xl transition active:scale-90"
          >
            <i className="ti ti-menu-2" />
          </button>

          <img src={logoUrl} alt="Logo" className="h-8 w-auto max-w-[55%] object-contain" />

          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/20 border border-white/30 text-sm font-extrabold overflow-hidden">
            {sessionUser?.photo_url ? (
              <img
                src={sessionUser.photo_url.startsWith("/uploads") ? `http://localhost:8080${sessionUser.photo_url}` : sessionUser.photo_url}
                alt={user.name}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              user.name ? user.name[0].toUpperCase() : "U"
            )}
          </div>
        </div>
      </header>

      {/* Compensa a altura do header fixo */}
      <div className="h-14" style={{ marginTop: "env(safe-area-inset-top)" }} />

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

      <SplashScreen logoUrl={logoUrl} name={tenantData?.client_name} />
    </div>
  )
}
