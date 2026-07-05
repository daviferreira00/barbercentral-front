"use client"

// Barra de ações fixa no rodapé (submits de formulário na experiência mobile)
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  )
}
