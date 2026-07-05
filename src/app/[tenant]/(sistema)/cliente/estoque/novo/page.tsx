"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import NovoProdutoDesktop from "./NovoProdutoDesktop"
import NovoProdutoMobile from "./NovoProdutoMobile"

export default function NovoProdutoPage() {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? <NovoProdutoMobile /> : <NovoProdutoDesktop />
}
