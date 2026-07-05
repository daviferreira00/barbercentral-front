"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import IdentidadeVisualDesktop from "./IdentidadeVisualDesktop"
import IdentidadeVisualMobile from "./IdentidadeVisualMobile"

export default function IdentidadeVisualPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <IdentidadeVisualMobile /> : <IdentidadeVisualDesktop />
}
