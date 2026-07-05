"use client"

import Link from "next/link"
import { haptic } from "@/shared/lib/haptics"

interface FabProps {
  icon: string
  href?: string
  onClick?: () => void
  ariaLabel?: string
}

// Botão de ação flutuante (ação principal da tela)
export function Fab({ icon, href, onClick, ariaLabel }: FabProps) {
  const className =
    "mobile-tap fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white text-2xl shadow-lg shadow-black/25 transition-transform active:scale-90"
  const style = {
    bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
    backgroundColor: "var(--color-primary)",
  }

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={className} style={style} onClick={() => haptic()}>
        <i className={`ti ${icon}`} />
      </Link>
    )
  }

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={() => {
        haptic()
        onClick?.()
      }}
    >
      <i className={`ti ${icon}`} />
    </button>
  )
}
