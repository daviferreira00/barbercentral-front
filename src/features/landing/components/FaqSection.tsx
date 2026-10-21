"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, Sparkles, MessageCircle } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "Preciso cadastrar cartão de crédito para fazer o teste de 7 dias?",
    answer:
      "Não! O período de 7 dias grátis é 100% livre de compromisso e não exige nenhum dado de cartão de crédito. Você cria a sua conta em menos de 1 minuto e já começa a cadastrar barbeiros, horários e serviços imediatamente.",
  },
  {
    question: "Como funciona a confirmação automática por WhatsApp?",
    answer:
      "Quando o seu cliente agenda um corte ou barba pelo link da sua barbearia, o BarberCentral envia lembretes inteligentes automáticos via WhatsApp com botões de confirmação. Isso reduz as faltas e no-shows em até 45% sem que você precise mandar mensagens manualmente.",
  },
  {
    question: "O sistema funciona em celular, tablet e computador?",
    answer:
      "Sim! O BarberCentral é 100% responsivo e otimizado para qualquer tela. Seus barbeiros podem usar direto no smartphone ou tablet na bancada, os recepcionistas no computador e o gestor pode acompanhar as métricas em tempo real de onde estiver.",
  },
  {
    question: "Consigo comissionar barbeiros e controlar o caixa da equipe?",
    answer:
      "Com certeza. Você define comissões personalizadas por profissional ou por serviço (percentual ou valor fixo). Ao fechar a comanda, o BarberCentral calcula o rateio automático, gera o fechamento de caixa diário e relatórios detalhados para pagamento dos profissionais.",
  },
  {
    question: "O que é o Modo TV / KDS para a recepção?",
    answer:
      "É um painel moderno e interativo projetado para rodar em smart TVs ou monitores na sala de espera. Ele exibe a fila de clientes do dia, status de atendimento em tempo real e promoções da sua barbearia com visual sofisticado.",
  },
  {
    question: "Já tenho dados de clientes em outra planilha ou sistema, como migrar?",
    answer:
      "Nossa equipe de suporte auxilia você na importação da sua lista de clientes e catálogo de serviços durante o período de onboarding para garantir uma transição sem nenhum atrito para sua barbearia.",
  },
]

interface FaqSectionProps {
  onOpenTrial: () => void
}

export function FaqSection({ onOpenTrial }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#E4C56B]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E4C56B]">
              Dúvidas frequentes
            </span>
            <span className="h-px w-6 bg-[#E4C56B]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Perguntas frequentes
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Tudo o que você precisa saber sobre o BarberCentral antes de começar.
          </p>
        </div>

        {/* Lista de Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#E4C56B]/40 bg-[#111C38]/90 shadow-lg shadow-[#E4C56B]/5"
                    : "border-white/10 bg-[#111C38]/50 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left gap-4 focus:outline-none"
                >
                  <span className="flex items-center gap-3 text-base sm:text-lg font-bold text-white">
                    <HelpCircle className={`h-5 w-5 shrink-0 transition-colors ${isOpen ? "text-[#E4C56B]" : "text-slate-400"}`} />
                    {faq.question}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 border-[#E4C56B] bg-[#E4C56B]/10 text-[#E4C56B]"
                        : "border-white/10 bg-white/5 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/5 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA Banner de Suporte */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-r from-[#111C38] via-[#0E172F] to-[#152345] p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left space-y-1">
            <h4 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E4C56B]" />
              Ficou alguma dúvida sobre o sistema?
            </h4>
            <p className="text-sm text-slate-400 font-medium">
              Fale diretamente com nossa equipe especializada pelo WhatsApp.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20BarberCentral"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              Falar no WhatsApp
            </a>
            <button
              onClick={onOpenTrial}
              className="inline-flex items-center gap-2 rounded-full bg-[#E4C56B] px-5 py-3 text-xs sm:text-sm font-black text-[#0D172E] shadow-md shadow-[#E4C56B]/20 hover:bg-[#ebd283] transition transform hover:scale-[1.02]"
            >
              Testar 7 dias grátis
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
