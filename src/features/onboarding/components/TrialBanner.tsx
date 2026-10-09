"use client"

import Link from "next/link"
import { useApp } from "@/shared/context/AppContext"
import { Clock, Zap, ArrowRight } from "lucide-react"

export function TrialBanner() {
  const { onboarding, user } = useApp()

  if (!onboarding || onboarding.subscription_status !== "trial") {
    if (user?.subscription_status !== "trial") {
      return null
    }
  }

  const daysRemaining = onboarding?.days_remaining ?? 7

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-950" />
        </div>
        <span>
          <strong>Período de Testes Grátis Ativo:</strong> Você possui{" "}
          <span className="underline decoration-slate-950 font-bold">{daysRemaining} dias restantes</span>{" "}
          com acesso ilimitado ao Plano Pro.
        </span>
      </div>

      <Link
        href="/cliente/configuracoes/plano"
        className="px-3 py-1 bg-slate-950 text-amber-400 hover:bg-slate-900 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 shadow-sm"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span>Escolher Plano / Assinar</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
