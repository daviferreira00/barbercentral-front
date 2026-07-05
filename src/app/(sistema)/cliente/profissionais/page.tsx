"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ProfissionaisDesktop from "./ProfissionaisDesktop"
import ProfissionaisMobile from "./ProfissionaisMobile"

export default function ClienteProfissionaisPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <ProfissionaisMobile /> : <ProfissionaisDesktop />
}
