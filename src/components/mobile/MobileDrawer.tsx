"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { haptic } from "@/shared/lib/haptics"
import type { NavSection } from "@/shared/config/nav"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  sections: NavSection[]
  userName?: string
  userRole?: string
  tenantName?: string | null
  onLogout: () => void
  onSwitchClient?: () => void
}

export function MobileDrawer({
  open,
  onClose,
  sections,
  userName,
  userRole,
  tenantName,
  onLogout,
  onSwitchClient,
}: MobileDrawerProps) {
  const pathname = usePathname()
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Trava o scroll da página enquanto o drawer está aberto
  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [open])

  const isActive = (href: string) =>
    href === "/cliente" ? pathname?.endsWith("/cliente") : pathname?.includes(href)

  const toggleSection = (title: string) => {
    haptic()
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  let itemIndex = 0

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabeçalho com gradiente da marca */}
        <div
          className="px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 65%, black))",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-lg font-extrabold">
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold truncate">{userName || "Usuário"}</p>
              <p className="text-[11px] font-semibold text-white/70 truncate">
                {userRole || "Dono da Barbearia"}
              </p>
              {tenantName && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 truncate mt-0.5">
                  <i className="ti ti-building-store mr-1" />
                  {tenantName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navegação (key={open} refaz a animação em cascata a cada abertura) */}
        <nav key={open ? "open" : "closed"} className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 flex flex-col gap-4">
          {sections.map((section) => {
            const collapsed = collapsedSections[section.title]
            return (
              <div key={section.title} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mobile-tap"
                >
                  {section.title}
                  <i
                    className={`ti ti-chevron-down text-sm transition-transform duration-200 ${
                      collapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {!collapsed &&
                  section.items.map((item) => {
                    const active = isActive(item.href)
                    const delay = `${Math.min(itemIndex++, 10) * 40}ms`
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          haptic()
                          onClose()
                        }}
                        className={`animate-drawer-item mobile-tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                          active
                            ? "text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                        style={{
                          animationDelay: delay,
                          ...(active ? { backgroundColor: "var(--color-primary)" } : {}),
                        }}
                      >
                        <i className={`ti ${item.icon} text-lg ${active ? "" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
              </div>
            )
          })}
        </nav>

        {/* Rodapé: trocar barbearia + sair + powered by */}
        <div className="border-t border-slate-100 p-3 pb-safe flex flex-col gap-1">
          {onSwitchClient && (
            <button
              onClick={() => {
                haptic()
                onClose()
                onSwitchClient()
              }}
              className="mobile-tap flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] transition"
            >
              <i className="ti ti-switch-horizontal text-lg text-slate-400" />
              Trocar de barbearia
            </button>
          )}
          <button
            onClick={() => {
              haptic()
              onClose()
              onLogout()
            }}
            className="mobile-tap flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition"
          >
            <i className="ti ti-logout text-lg" />
            Sair da conta
          </button>
          <div className="flex flex-col items-center gap-0.5 pt-2 pb-1">
            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
              Powered by
            </span>
            <img
              src="/logo/barbercentral-logo-horizontal.svg"
              alt="Barber Central"
              className="h-4 w-auto object-contain opacity-50"
            />
          </div>
        </div>
      </aside>
    </>
  )
}
