"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import BloqueiosDesktop from "./BloqueiosDesktop"
import BloqueiosMobile from "./BloqueiosMobile"

export default function AgendaBloqueiosPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <BloqueiosMobile /> : <BloqueiosDesktop />
}
