"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import HistoricoDesktop from "./HistoricoDesktop"
import HistoricoMobile from "./HistoricoMobile"

export default function HistoricoCaixasPage() {
	const isMobile = useIsMobile()
	if (isMobile === null) return null
	return isMobile ? <HistoricoMobile /> : <HistoricoDesktop />
}
