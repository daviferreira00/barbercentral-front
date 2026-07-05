"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import EstoqueDesktop from "./EstoqueDesktop"
import EstoqueMobile from "./EstoqueMobile"

export default function EstoquePage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <EstoqueMobile /> : <EstoqueDesktop />
}
