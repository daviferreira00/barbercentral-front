"use client"

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-card-enter flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
        <i className={`ti ${icon}`} />
      </div>
      <p className="mt-1 text-sm font-extrabold text-slate-700">{title}</p>
      {description && <p className="text-xs font-medium text-slate-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
