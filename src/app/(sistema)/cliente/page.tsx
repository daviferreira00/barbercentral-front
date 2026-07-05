"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import DashboardDesktop from "./DashboardDesktop"
import DashboardMobile from "./DashboardMobile"

export default function ClientePage() {
  const isMobile = useIsMobile()
  if (isMobile === null) return null
  return isMobile ? <DashboardMobile /> : <DashboardDesktop />
}
