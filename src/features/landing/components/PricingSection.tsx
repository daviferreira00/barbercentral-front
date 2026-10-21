"use client"

import { Check, Crown, Zap, ArrowRight, ShieldCheck } from "lucide-react"

interface PricingSectionProps {
  onOpenTrial: () => void
}

export function PricingSection({ onOpenTrial }: PricingSectionProps) {
  return (
    <section id="precos" className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#E4C56B]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E4C56B]">
              Investimento transparente
            </span>
            <span className="h-px w-6 bg-[#E4C56B]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Planos sob medida para o tamanho do seu negócio
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Comece com 7 dias grátis para testar com sua equipe. Sem pegadinhas, cancele a qualquer momento.
          </p>
        </div>

        {/* Cards dos Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Card Plano SMART */}
          <div className="relative rounded-3xl border border-white/10 bg-[#111C38]/70 p-8 flex flex-col justify-between backdrop-blur-md transition hover:border-white/20">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-slate-400" />
                    <h3 className="text-2xl font-black text-white">SMART</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Operação essencial para barbearias</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Iniciante
                </span>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400">R$</span>
                  <span className="text-4xl font-black text-white">79,90</span>
                  <span className="text-xs text-slate-400 font-medium">/ mês</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Faturamento mensal, sem taxa de cancelamento</p>
              </div>

              {/* Lista de Recursos */}
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Até <strong>3 profissionais</strong> (cadeiras)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Clientes e agendamentos <strong>ilimitados</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Página pública de agendamento online 24/7</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Gestão de horários e frente de caixa</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Cadastro completo e histórico de clientes</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-500 line-through">
                  <span>Automação de WhatsApp e Lembretes</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-500 line-through">
                  <span>Programa de Fidelidade Digital</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenTrial}
              className="w-full rounded-2xl border border-white/20 bg-white/5 py-3.5 text-xs font-bold text-white transition hover:bg-white/10 hover:border-white/30 cursor-pointer"
            >
              Testar 7 dias grátis
            </button>
          </div>

          {/* Card Plano PRO (Destaque Dourado) */}
          <div className="relative rounded-3xl border-2 border-[#E4C56B] bg-gradient-to-b from-[#162347] via-[#111C38] to-[#0D172E] p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(228,197,107,0.15)] transition hover:shadow-[0_0_60px_rgba(228,197,107,0.25)]">
            
            {/* Badge Mais Recomendado */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-md flex items-center gap-1.5">
              <Crown className="h-3 w-3 fill-slate-950" />
              <span>Mais Recomendado</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-6 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[#E4C56B]" />
                    <h3 className="text-2xl font-black text-white">PRO</h3>
                  </div>
                  <p className="text-xs text-[#E4C56B] font-semibold mt-1">Automação total para escalar sua barbearia</p>
                </div>
                <span className="rounded-full bg-[#E4C56B]/20 border border-[#E4C56B]/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#E4C56B]">
                  Completo
                </span>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400">R$</span>
                  <span className="text-4xl font-black text-[#E4C56B]">149,90</span>
                  <span className="text-xs text-slate-400 font-medium">/ mês</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Todas as funcionalidades liberadas</p>
              </div>

              {/* Lista de Recursos PRO */}
              <ul className="space-y-3.5 text-xs text-slate-200 mb-8 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span><strong>Profissionais (cadeiras) ILIMITADOS</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span><strong>Automação de WhatsApp</strong> (lembretes e confirmações)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span><strong>Programa de Fidelidade Digital</strong> com selos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span><strong>Painel KDS / Fila de Atendimento</strong> em tempo real</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Controle de Estoque e Venda de Produtos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Relatórios Financeiros Avançados & Divisão de Comissões</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#E4C56B] shrink-0" />
                  <span>Suporte prioritário via WhatsApp</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenTrial}
              className="w-full rounded-2xl bg-gradient-to-r from-[#E4C56B] to-[#C99E32] py-4 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(228,197,107,0.35)] transition hover:shadow-[0_0_30px_rgba(228,197,107,0.5)] hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Começar 7 dias grátis no Pro</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}
