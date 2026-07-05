"use client"

interface KpiCardProps {
  label: string
  value: React.ReactNode
  icon: string
  hint?: React.ReactNode
  onClick?: () => void
  className?: string
}

// Card de indicador estilo "app de banco"
export function KpiCard({ label, value, icon, hint, onClick, className = "" }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`animate-card-enter mobile-tap rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm ${
        onClick ? "cursor-pointer transition-transform active:scale-[0.98]" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, black))",
          }}
        >
          <i className={`ti ${icon}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="truncate text-xl font-extrabold text-slate-800">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  )
}
