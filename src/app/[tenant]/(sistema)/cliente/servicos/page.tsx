"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ServicosDesktop from "./ServicosDesktop"
import ServicosMobile from "./ServicosMobile"

export default function ClienteServicosPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <ServicosMobile /> : <ServicosDesktop />
}
