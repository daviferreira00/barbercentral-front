"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ClientesDesktop from "./ClientesDesktop"
import ClientesMobile from "./ClientesMobile"

export default function ClientesPage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <ClientesMobile /> : <ClientesDesktop />
}
