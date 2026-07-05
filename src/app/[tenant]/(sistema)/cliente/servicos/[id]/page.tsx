"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ServicoDetailDesktop from "./ServicoDetailDesktop"
import ServicoDetailMobile from "./ServicoDetailMobile"

export default function ServicoDetailPage({ params }: { params: { id: string } }) {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? (
    <ServicoDetailMobile serviceId={params.id} />
  ) : (
    <ServicoDetailDesktop serviceId={params.id} />
  )
}
