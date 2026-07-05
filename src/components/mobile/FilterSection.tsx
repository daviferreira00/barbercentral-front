"use client"

import { haptic } from "@/shared/lib/haptics"

interface FilterSectionProps {
  open: boolean
  onToggle: () => void
  activeCount?: number
  children: React.ReactNode
}

// Filtros recolhidos por padrão: botão "Filtros" + painel expansível
export function FilterSection({ open, onToggle, activeCount = 0, children }: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => {
          haptic()
          onToggle()
        }}
        className={`mobile-tap flex items-center gap-2 self-start rounded-xl border px-3.5 py-2 text-xs font-extrabold transition active:scale-95 ${
          open
            ? "border-transparent text-white shadow-md"
            : "border-slate-200 bg-white text-slate-600"
        }`}
        style={open ? { backgroundColor: "var(--color-primary)" } : {}}
      >
        <i className="ti ti-adjustments-horizontal text-base" />
        Filtros
        {activeCount > 0 && (
          <span
            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
              open ? "bg-white/25 text-white" : "text-white"
            }`}
            style={open ? {} : { backgroundColor: "var(--color-primary)" }}
          >
            {activeCount}
          </span>
        )}
        <i className={`ti ti-chevron-down text-sm transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          {children}
        </div>
      )}
    </div>
  )
}
