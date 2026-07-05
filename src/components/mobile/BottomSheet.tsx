"use client"

import { useEffect, useState } from "react"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxHeight?: string
}

// Painel "swipe up" que substitui modais na experiência mobile
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeight = "88vh",
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // dois frames para a transição de entrada disparar após o mount
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [open])

  // Trava o scroll da página enquanto o sheet está aberto
  useEffect(() => {
    if (!mounted) return
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
          shown ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight, transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alça visual */}
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-slate-800">{title}</h3>
            {subtitle && <p className="truncate text-xs font-medium text-slate-400">{subtitle}</p>}
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="mobile-tap flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
          >
            <i className="ti ti-x text-base" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ overscrollBehavior: "contain" }}>
          {children}
        </div>

        {/* Rodapé fixo (ações) */}
        {footer && <div className="border-t border-slate-100 px-5 py-3 pb-safe">{footer}</div>}

        {!footer && <div className="pb-safe" />}
      </div>
    </div>
  )
}
