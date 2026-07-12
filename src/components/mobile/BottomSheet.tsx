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

  // Trava o scroll da página enquanto o sheet está aberto (compatível com iOS)
  useEffect(() => {
    if (!mounted) return
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalHeight = document.body.style.height
    
    document.body.style.overflow = "hidden"
    document.body.style.position = "relative"
    document.body.style.height = "100%"
    
    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.height = "100%"

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.height = originalHeight
      
      document.documentElement.style.overflow = ""
      document.documentElement.style.height = ""
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-end bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
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
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-black text-slate-800 uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="truncate text-[10px] font-bold text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="mobile-tap flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-90"
          >
            <i className="ti ti-x text-sm" />
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
