"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import ProfissionalDetailDesktop from "./ProfissionalDetailDesktop"
import ProfissionalDetailMobile from "./ProfissionalDetailMobile"

export default function ProfessionalDetailPage({ params }: { params: { id: string } }) {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? (
    <ProfissionalDetailMobile professionalId={params.id} />
  ) : (
    <ProfissionalDetailDesktop professionalId={params.id} />
  )
}
