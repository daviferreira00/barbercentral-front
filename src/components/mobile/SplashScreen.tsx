"use client"

import { useEffect, useState } from "react"

const SPLASH_FLAG = "bc_splash_shown"

// Tela de abertura estilo app: aparece uma vez por sessão no mobile
export function SplashScreen({ logoUrl, name }: { logoUrl?: string | null; name?: string | null }) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden")

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_FLAG)) return
    sessionStorage.setItem(SPLASH_FLAG, "1")
    setPhase("visible")
    const t1 = setTimeout(() => setPhase("leaving"), 1000)
    const t2 = setTimeout(() => setPhase("hidden"), 1500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === "hidden") return null

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 transition-all duration-500 ${
        phase === "leaving" ? "opacity-0 scale-110" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(160deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, black))",
      }}
    >
      <img
        src={logoUrl || "/logo/barbercentral-logo-stacked-white.svg"}
        alt={name || "Barber Central"}
        className="h-24 w-auto max-w-[60%] object-contain animate-card-enter"
      />
      <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-full bg-white/70 animate-loading-bar" />
      </div>
    </div>
  )
}
