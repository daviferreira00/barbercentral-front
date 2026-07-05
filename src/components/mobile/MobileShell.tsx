"use client"

import { useState } from "react"
import { clienteNavSections } from "@/shared/config/nav"
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

// Shell da experiência mobile: header fixo + drawer lateral retraído por padrão
export function MobileShell({ children, user, tenantData, onLogout }: MobileShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { myClients, user: sessionUser, setSelectorOpen } = useApp()

  // Só oferece a troca quando há para onde trocar (2+ vínculos ou admin impersonando)
  const canSwitchClient = myClients.length > 1 || !!sessionUser?.impersonating

  const logoUrl =
    tenantData && (tenantData.logo_url || tenantData.logo_central)
      ? tenantData.logo_url || tenantData.logo_central
      : "/logo/barbercentral-logo-horizontal-white.svg"

  return (
    <div className="min-h-dvh bg-slate-100 font-sans">
      {/* Header fixo com gradiente da marca */}
      <header
        className="fixed inset-x-0 top-0 z-40 text-white"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 92%, white), color-mix(in srgb, var(--color-primary) 70%, black))",
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

          <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/20 border border-white/30 text-sm font-extrabold">
            {user.name ? user.name[0].toUpperCase() : "U"}
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
        sections={clienteNavSections}
        userName={user.name}
        userRole={user.role === "admin" ? "Administrador" : "Dono da Barbearia"}
        tenantName={tenantData?.client_name || null}
        onLogout={onLogout}
        onSwitchClient={canSwitchClient ? () => setSelectorOpen(true) : undefined}
      />

      <SplashScreen logoUrl={logoUrl} name={tenantData?.client_name} />
    </div>
  )
}
