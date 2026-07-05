"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ConfigAgendaDesktop from "./ConfigAgendaDesktop"
import ConfigAgendaMobile from "./ConfigAgendaMobile"

export default function ConfigAgendaPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <ConfigAgendaMobile /> : <ConfigAgendaDesktop />
}
