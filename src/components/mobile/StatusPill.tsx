export type PillTone = "success" | "warning" | "danger" | "info" | "neutral"

const TONES: Record<PillTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: PillTone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[10px] border px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide ${TONES[tone]}`}
    >
      {label}
    </span>
  )
}
