"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ConfigPlanoDesktop from "./ConfigPlanoDesktop"
import ConfigPlanoMobile from "./ConfigPlanoMobile"

export default function PlanUsagePage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <ConfigPlanoMobile /> : <ConfigPlanoDesktop />
}
