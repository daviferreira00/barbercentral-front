"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ConfigFidelidadeDesktop from "./ConfigFidelidadeDesktop"
import ConfigFidelidadeMobile from "./ConfigFidelidadeMobile"

export default function LoyaltyConfigPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <ConfigFidelidadeMobile /> : <ConfigFidelidadeDesktop />
}
