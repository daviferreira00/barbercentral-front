"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useApp } from "@/shared/context/AppContext"
import { LandingPage } from "@/features/landing/LandingPage"
import type { ModalTab } from "@/features/landing/components/LoginModal"

function LandingPageWrapper() {
  const searchParams = useSearchParams()
  const isLoginRequested = searchParams.get("login") === "true"
  const isTrialRequested = searchParams.get("trial") === "true"

  const initialLoginOpen = isLoginRequested || isTrialRequested
  const initialTab: ModalTab = isTrialRequested ? "trial" : "login"

  return (
    <LandingPage
      initialLoginOpen={initialLoginOpen}
      initialTab={initialTab}
    />
  )
}

export default function RootPage() {
  const { user, loading } = useApp()

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === "admin") {
          window.location.href = "/admin"
        } else {
          window.location.href = "/cliente"
        }
      } else if (typeof window !== "undefined") {
        const hostname = window.location.hostname.toLowerCase()
        if (hostname.startsWith("app.")) {
          window.location.href = "/login"
        }
      }
    }
  }, [user, loading])

  // Enquanto valida sessão
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0D172E]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E4C56B] border-t-transparent" />
      </div>
    )
  }

  // Se já autenticado, aguarda redirect
  if (user) {
    return null
  }

  // Visitante não autenticado: Renderiza Landing Page integrada
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#0D172E]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E4C56B] border-t-transparent" />
        </div>
      }
    >
      <LandingPageWrapper />
    </Suspense>
  )
}
