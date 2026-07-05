"use client"

import { StatusPill, type PillTone } from "./StatusPill"

interface ListCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  pill?: { label: string; tone: PillTone }
  footerLeft?: React.ReactNode
  footerRight?: React.ReactNode
  onClick?: () => void
  index?: number
}

// Card de listagem mobile (substitui linhas de tabela)
export function ListCard({ title, subtitle, pill, footerLeft, footerRight, onClick, index = 0 }: ListCardProps) {
  const hasFooter = footerLeft || footerRight

  return (
    <div
      onClick={onClick}
      className={`animate-card-enter mobile-tap rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
        onClick ? "cursor-pointer transition-transform active:scale-[0.98]" : ""
      }`}
      style={{ animationDelay: `${(index % 10) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-slate-800">{title}</p>
          {subtitle && <div className="mt-0.5 truncate text-xs font-medium text-slate-400">{subtitle}</div>}
        </div>
        {pill && <StatusPill label={pill.label} tone={pill.tone} />}
      </div>

      {hasFooter && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
          <div className="min-w-0 text-xs font-semibold text-slate-500">{footerLeft}</div>
          <div className="shrink-0 text-sm font-extrabold text-slate-800">{footerRight}</div>
        </div>
      )}
    </div>
  )
}
