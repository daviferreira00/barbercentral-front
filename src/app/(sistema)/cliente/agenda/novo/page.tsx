"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import NovoAgendamentoDesktop from "./NovoAgendamentoDesktop"
import NovoAgendamentoMobile from "./NovoAgendamentoMobile"

export default function NovoAgendamentoPainelPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <NovoAgendamentoMobile /> : <NovoAgendamentoDesktop />
}
