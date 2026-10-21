"use client"

import { ArrowRight, ChevronDown, Sparkles, CheckCircle } from "lucide-react"
import { BarbershopTicketCard } from "./BarbershopTicketCard"

interface LandingHeroProps {
  onOpenTrial: () => void
  onExploreFeatures: () => void
}

export function LandingHero({ onOpenTrial, onExploreFeatures }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Luzes difusas de ambiente no fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#E4C56B]/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-[#E4C56B]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Coluna Esquerda: Mensagem e Chamada para Ação */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline com linha dourada */}
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[#E4C56B]" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#E4C56B]">
                A plataforma de gestão para barbearias
              </span>
            </div>

            {/* Headline Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Eleve o nível da{" "}
              <span className="bg-gradient-to-r from-white via-[#E4C56B] to-[#F3D78A] bg-clip-text text-transparent">
                sua barbearia✦
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="max-w-xl text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Agendamento online 24/7, lembretes automáticos no WhatsApp, controle de caixa e fidelidade — tudo em um só lugar. Sem burocracia, para você focar no corte.
            </p>

            {/* Botões CTA em Pílula */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onOpenTrial}
                className="group rounded-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] px-7 py-4 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(228,197,107,0.4)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(228,197,107,0.6)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Experimentar 7 dias grátis</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer text-center"
              >
                Ver demonstração
              </button>
            </div>

            {/* Microcopy de garantia */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
              <CheckCircle className="h-3.5 w-3.5 text-[#E4C56B]" />
              <span>Teste grátis por 7 dias · Sem cartão de crédito · Cancele quando quiser</span>
            </div>

            {/* Barra de Métricas */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">+50.000</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">agendamentos realizados</p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#E4C56B] tracking-tight">99%</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">menos faltas com WhatsApp</p>
              </div>

              <div className="hidden sm:block">
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">4.9★</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">avaliação dos barbeiros</p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Ticket e Produto Flutuante */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <BarbershopTicketCard />
          </div>

        </div>

        {/* Indicador de rolagem */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={onExploreFeatures}
            className="flex flex-col items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-[#E4C56B] transition cursor-pointer group"
          >
            <span>Conheça os recursos</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/20 p-1 group-hover:border-[#E4C56B]/60 transition">
              <div className="h-1.5 w-1 rounded-full bg-[#E4C56B] animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
