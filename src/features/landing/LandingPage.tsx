"use client"

import { useState } from "react"
import { LandingNavbar } from "./components/LandingNavbar"
import { LandingHero } from "./components/LandingHero"
import { FeatureGrid } from "./components/FeatureGrid"
import { HowItWorksSection } from "./components/HowItWorksSection"
import { PricingSection } from "./components/PricingSection"
import { FaqSection } from "./components/FaqSection"
import { LandingFooter } from "./components/LandingFooter"
import { LoginModal, type ModalTab } from "./components/LoginModal"

interface LandingPageProps {
  initialLoginOpen?: boolean
  initialTab?: ModalTab
}

export function LandingPage({
  initialLoginOpen = false,
  initialTab = "login",
}: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(initialLoginOpen)
  const [modalTab, setModalTab] = useState<ModalTab>(initialTab)

  const handleOpenLogin = () => {
    setModalTab("login")
    setIsModalOpen(true)
  }

  const handleOpenTrial = () => {
    setModalTab("trial")
    setIsModalOpen(true)
  }

  const handleExploreFeatures = () => {
    const el = document.getElementById("recursos")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#0D172E] text-slate-100 selection:bg-[#E4C56B] selection:text-[#0D172E] relative font-sans antialiased overflow-x-hidden">
      {/* Grade de fundo sutil inspirada na referência Linear / Evify */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Navbar Superior */}
      <LandingNavbar
        onOpenLogin={handleOpenLogin}
        onOpenTrial={handleOpenTrial}
      />

      {/* Hero com Ticket Interativo */}
      <LandingHero
        onOpenTrial={handleOpenTrial}
        onExploreFeatures={handleExploreFeatures}
      />

      {/* Recursos e Diferenciais */}
      <FeatureGrid />

      {/* Como Funciona em 3 Passos */}
      <HowItWorksSection onOpenTrial={handleOpenTrial} />

      {/* Tabela de Preços e Comparativo */}
      <PricingSection onOpenTrial={handleOpenTrial} />

      {/* Perguntas Frequentes */}
      <FaqSection onOpenTrial={handleOpenTrial} />

      {/* Rodapé Oficial */}
      <LandingFooter
        onOpenLogin={handleOpenLogin}
        onOpenTrial={handleOpenTrial}
      />

      {/* Modal Integrado de Login e Teste de 7 Dias */}
      <LoginModal
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
export default LandingPage
