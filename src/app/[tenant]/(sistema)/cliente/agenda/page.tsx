"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import AgendaDesktop from "./AgendaDesktop"
import AgendaMobile from "./AgendaMobile"

export default function ClienteAgendaPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <AgendaMobile /> : <AgendaDesktop />
}
