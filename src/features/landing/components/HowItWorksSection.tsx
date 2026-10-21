"use client"

import { UserPlus, Settings, Share2, Sparkles, ArrowRight } from "lucide-react"

interface HowItWorksProps {
  onOpenTrial: () => void
}

export function HowItWorksSection({ onOpenTrial }: HowItWorksProps) {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Cadastre sua barbearia em 1 minuto",
      description: "Comece seu teste de 7 dias grátis sem precisar de cartão de crédito. Sua conta fica pronta imediatamente.",
    },
    {
      step: "02",
      icon: Settings,
      title: "Adicione sua equipe e serviços",
      description: "Cadastre seus barbeiros, dias de atendimento e a lista de cortes e serviços com seus respectivos valores.",
    },
    {
      step: "03",
      icon: Share2,
      title: "Divulgue seu link e receba clientes",
      description: "Coloque o link exclusivo na bio do Instagram e WhatsApp. Os clientes agendam sozinhos e recebem lembretes automáticos.",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 lg:py-28 relative border-t border-white/5 bg-[#0A1022]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#E4C56B]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E4C56B]">
              Simples e sem burocracia
            </span>
            <span className="h-px w-6 bg-[#E4C56B]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Como funciona na prática
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Em menos de 5 minutos sua barbearia estará pronta para receber agendamentos online e automatizar seu dia a dia.
          </p>
        </div>

        {/* 3 Passos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="relative rounded-3xl border border-white/5 bg-[#0D172E]/80 p-8 text-left transition hover:border-[#E4C56B]/30 hover:bg-[#111C38] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-4xl font-black text-white/10 font-mono">
                      {s.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4C56B]/10 border border-[#E4C56B]/20 text-[#E4C56B]">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {s.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {s.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Banner Central */}
        <div className="mt-16 text-center">
          <button
            onClick={onOpenTrial}
            className="rounded-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] px-8 py-4 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(228,197,107,0.35)] transition hover:shadow-[0_0_40px_rgba(228,197,107,0.5)] hover:scale-[1.02] active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Quero começar meu teste de 7 dias agora</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  )
}
