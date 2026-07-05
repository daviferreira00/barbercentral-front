"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import CaixaDesktop from "./CaixaDesktop"
import CaixaMobile from "./CaixaMobile"

export default function CaixaPage() {
	const isMobile = useIsMobile()
	if (isMobile === null) return null
	return isMobile ? <CaixaMobile /> : <CaixaDesktop />
}
