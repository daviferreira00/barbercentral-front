"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import NovoProfissionalDesktop from "./NovoProfissionalDesktop"
import NovoProfissionalMobile from "./NovoProfissionalMobile"

export default function NovoProfissionalPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <NovoProfissionalMobile /> : <NovoProfissionalDesktop />
}
