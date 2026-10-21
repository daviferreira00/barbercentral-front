"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"

interface LandingNavbarProps {
  onOpenLogin: () => void
  onOpenTrial: () => void
}

export function LandingNavbar({ onOpenLogin, onOpenTrial }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0D172E]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition transform hover:scale-[1.01]">
          <img
            src="/logo/barbercentral-logo-horizontal-white.png"
            alt="BarberCentral"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback caso png não carregue
              const target = e.target as HTMLImageElement
              target.src = "/logo/barbercentral-logo-horizontal-white.svg"
            }}
          />
        </Link>

        {/* Links de Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <button
            onClick={() => scrollTo("recursos")}
            className="hover:text-[#E4C56B] transition-colors cursor-pointer"
          >
            Recursos
          </button>
          <button
            onClick={() => scrollTo("como-funciona")}
            className="hover:text-[#E4C56B] transition-colors cursor-pointer"
          >
            Como funciona
          </button>
          <button
            onClick={() => scrollTo("precos")}
            className="hover:text-[#E4C56B] transition-colors cursor-pointer"
          >
            Preços
          </button>
          <button
            onClick={() => scrollTo("duvidas")}
            className="hover:text-[#E4C56B] transition-colors cursor-pointer"
          >
            Dúvidas
          </button>
        </nav>

        {/* Botões de Ação Desktop */}
        <div className="hidden md:flex items-center gap-3.5">
          <button
            onClick={onOpenLogin}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer"
          >
            Entrar
          </button>
          <button
            onClick={onOpenTrial}
            className="rounded-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-[0_0_20px_rgba(228,197,107,0.35)] transition hover:shadow-[0_0_28px_rgba(228,197,107,0.5)] hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Experimentar grátis</span>
          </button>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenLogin}
            className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white"
          >
            Entrar
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu Aberto Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0D172E] px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3 font-semibold text-slate-200 text-sm">
            <button
              onClick={() => scrollTo("recursos")}
              className="text-left py-2 hover:text-[#E4C56B]"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollTo("como-funciona")}
              className="text-left py-2 hover:text-[#E4C56B]"
            >
              Como funciona
            </button>
            <button
              onClick={() => scrollTo("precos")}
              className="text-left py-2 hover:text-[#E4C56B]"
            >
              Preços
            </button>
            <button
              onClick={() => scrollTo("duvidas")}
              className="text-left py-2 hover:text-[#E4C56B]"
            >
              Dúvidas
            </button>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenTrial()
              }}
              className="w-full rounded-full bg-gradient-to-r from-[#E4C56B] to-[#C99E32] py-3 text-center text-xs font-extrabold text-slate-950 shadow-lg"
            >
              Começar 7 dias grátis
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
