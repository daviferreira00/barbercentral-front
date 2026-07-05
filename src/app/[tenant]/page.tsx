"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/shared/context/AppContext"

export default function TenantRootPage({ params }: { params: { tenant: string } }) {
  const router = useRouter()
  const { user, loading } = useApp()
  const tenant = params.tenant

  useEffect(() => {
    if (!loading) {
      const isMainApp = tenant === "app" || tenant === "app.barbercentral.com.br" || tenant === "barbercentral.com.br"

      if (isMainApp) {
        if (user) {
          if (user.role === "admin") {
            router.push(`/${tenant}/admin`)
          } else {
            router.push(`/${tenant}/cliente`)
          }
        } else {
          router.push(`/${tenant}/login`)
        }
      } else {
        // Inquilino específico (ex: wbrothers)
        if (user) {
          router.push(`/${tenant}/cliente`)
        } else {
          router.push(`/${tenant}/agendamento/${tenant}`)
        }
      }
    }
  }, [user, loading, router, tenant])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
