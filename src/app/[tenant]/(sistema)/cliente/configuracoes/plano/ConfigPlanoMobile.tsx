"use client"

import Link from "next/link"
import { useConfigPlano } from "@/features/configuracoes/hooks/useConfigPlano"
import { Alert } from "@/components/ui/alert"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { 
  CheckCircle, 
  Lock, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  ShieldCheck, 
  Users, 
  Database, 
  FileBarChart 
} from "lucide-react"

export default function ConfigPlanoMobile() {
  const {
    usage,
    loading,
    errorMsg,
    getProgressValue,
    getUpgradeWhatsAppLink,
  } = useConfigPlano()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-semibold">Carregando dados...</span>
      </div>
    )
  }

  if (errorMsg || !usage) {
    return (
      <div className="flex flex-col gap-6 py-6 px-1 animate-fade-in">
        <Alert variant="error">
          {errorMsg || "Erro de conexão com o servidor."}
        </Alert>
      </div>
    )
  }

  const { plan, professionals, customers, users } = usage

  const renderLimitCard = (title: string, current: number, max: number, icon: any) => {
    const Icon = icon
    const pct = getProgressValue(current, max)
    const isUnlimited = max === -1
    const isLimitReached = !isUnlimited && current >= max

    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex flex-col gap-2 shadow-sm">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Icon className="h-4 w-4 text-slate-400" />
            <span>{title}</span>
          </div>
          <span className="font-extrabold text-slate-800">
            {current} <span className="text-slate-400 font-normal">/ {isUnlimited ? "∞" : max}</span>
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden border border-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLimitReached ? "bg-red-500" : pct > 85 ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {isLimitReached && (
          <span className="text-[9px] font-bold text-red-500 mt-0.5 block leading-none">Limite atingido! Solicite upgrade.</span>
        )}
      </div>
    )
  }

  const renderFeatureRow = (title: string, enabled: boolean) => {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2.5">
          {enabled ? (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          ) : (
            <Lock className="h-4.5 w-4.5 text-slate-350 shrink-0" />
          )}
          <span className={`text-xs font-semibold leading-none ${enabled ? "text-slate-700 font-extrabold" : "text-slate-400"}`}>
            {title}
          </span>
        </div>
        {!enabled && (
          <span className="text-[8px] font-black tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase border">
            Premium
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cliente"
            aria-label="Voltar"
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90 shadow-sm"
          >
            <i className="ti ti-arrow-left" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Assinatura & Plano</h1>
            <p className="text-xs font-semibold text-slate-400">Limites e recursos do seu plano.</p>
          </div>
        </div>
        <ShieldCheck className="h-7 w-7 text-primary" />
      </div>

      {/* Card do Plano */}
      <div className="animate-card-enter rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 relative shadow-lg overflow-hidden flex flex-col gap-4">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none">
          <Sparkles className="h-32 w-32" />
        </div>
        <div>
          <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block">Seu Plano Atual</span>
          <h2 className="text-lg font-black uppercase text-white mt-0.5 leading-none">{plan.name}</h2>
        </div>
        <div>
          <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block">Valor da Assinatura</span>
          <p className="text-2xl font-black text-primary mt-0.5 leading-none">
            {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Limites de uso */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Uso do Sistema</h3>
        <div className="flex flex-col gap-2.5">
          {renderLimitCard("Profissionais Cadastrados", professionals, plan.max_professionals, Users)}
          {renderLimitCard("Clientes na Base", customers, plan.max_customers, Database)}
          {renderLimitCard("Usuários do Painel", users, plan.max_users, FileBarChart)}
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Funcionalidades do Plano</h3>
        <div className="flex flex-col gap-2">
          {renderFeatureRow("Agendamento Online", plan.has_online_booking === 1)}
          {renderFeatureRow("Programa de Fidelidade", plan.has_loyalty === 1)}
          {renderFeatureRow("Controle de Estoque", plan.has_stock === 1)}
          {renderFeatureRow("Relatórios Financeiros", plan.has_reports === 1)}
        </div>
      </div>

      {/* Upgrade WhatsApp */}
      <ActionBar>
        <a 
          href={getUpgradeWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => haptic()}
          className="mobile-tap w-full rounded-xl py-3.5 bg-primary font-extrabold text-slate-900 shadow-md text-sm text-center flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>Falar com o Suporte / Upgrade</span>
        </a>
      </ActionBar>
    </div>
  )
}
