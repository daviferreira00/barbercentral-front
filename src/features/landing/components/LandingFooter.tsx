"use client"

import Link from "next/link"
import { ArrowUp, MessageCircle, ShieldCheck, Heart } from "lucide-react"

interface LandingFooterProps {
  onOpenLogin: () => void
  onOpenTrial: () => void
}

export function LandingFooter({ onOpenLogin, onOpenTrial }: LandingFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-white/5 bg-[#080E1E] text-slate-400 text-sm relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          
          {/* Coluna 1: Logo e Descrição */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo/barbercentral-logo-horizontal-white.png"
                alt="BarberCentral"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/logo/barbercentral-logo-horizontal-white.svg"
                }}
              />
            </Link>
            <p className="max-w-md text-slate-400 text-sm leading-relaxed">
              O ecossistema completo para gestão, agendamento online 24/7 e retenção de clientes criado especificamente para barbearias de alta performance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Dados criptografados SSL 256-bit
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                99.9% Uptime
              </span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Navegação</h5>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button
                  onClick={() => scrollTo("recursos")}
                  className="hover:text-[#E4C56B] transition-colors"
                >
                  Recursos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("como-funciona")}
                  className="hover:text-[#E4C56B] transition-colors"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("precos")}
                  className="hover:text-[#E4C56B] transition-colors"
                >
                  Planos & Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("faq")}
                  className="hover:text-[#E4C56B] transition-colors"
                >
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Acesso Rápido & Suporte */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white">Acesso & Suporte</h5>
            <div className="space-y-2.5">
              <button
                onClick={onOpenLogin}
                className="w-full text-left font-bold text-white hover:text-[#E4C56B] transition-colors block"
              >
                Entrar no Sistema →
              </button>
              <button
                onClick={onOpenTrial}
                className="w-full text-left font-bold text-[#E4C56B] hover:underline block"
              >
                Iniciar 7 Dias Grátis →
              </button>
              <div className="pt-2">
                <a
                  href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20BarberCentral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp de Suporte
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Linha Divisória e Rodapé Inferior */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BarberCentral. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Desenvolvido com foco na sua barbearia</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition"
              title="Voltar ao topo"
            >
              <span>Topo</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}
