"use client"

import { useIsMobile } from "@/shared/hooks/useIsMobile"
import LoginFormDesktop from "./LoginFormDesktop"
import LoginFormMobile from "./LoginFormMobile"

export function LoginForm({ logoUrl }: { logoUrl?: string }) {
  const isMobile = useIsMobile()
  
  if (isMobile === null) return null
  
  return isMobile ? (
    <LoginFormMobile logoUrl={logoUrl} />
  ) : (
    <LoginFormDesktop logoUrl={logoUrl} />
  )
}
