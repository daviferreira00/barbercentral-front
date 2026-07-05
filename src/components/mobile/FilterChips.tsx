"use client"

import { haptic } from "@/shared/lib/haptics"

interface FilterChipsProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

// Chips de filtro horizontais roláveis (seleção rápida)
export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => {
              haptic()
              onChange(opt.value)
            }}
            className={`mobile-tap shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition active:scale-95 ${
              active ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white text-slate-600"
            }`}
            style={active ? { backgroundColor: "var(--color-primary)" } : {}}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
