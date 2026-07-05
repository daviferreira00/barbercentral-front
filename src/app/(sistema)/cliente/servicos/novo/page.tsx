"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import NovoServicoDesktop from "./NovoServicoDesktop"
import NovoServicoMobile from "./NovoServicoMobile"

export default function NovoServicoPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <NovoServicoMobile /> : <NovoServicoDesktop />
}
