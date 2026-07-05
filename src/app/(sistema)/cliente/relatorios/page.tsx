"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import RelatoriosDesktop from "./RelatoriosDesktop"
import RelatoriosMobile from "./RelatoriosMobile"

export default function ReportsDashboard() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <RelatoriosMobile /> : <RelatoriosDesktop />
}
