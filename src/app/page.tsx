"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/shared/context/AppContext"

export default function RootPage() {
  const router = useRouter()
  const { user, loading } = useApp()

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/cliente")
        }
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
