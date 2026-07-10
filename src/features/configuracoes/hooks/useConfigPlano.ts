"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"

export interface Plan {
  id: string
  name: string
  max_professionals: number
  max_customers: number
  max_users: number
  has_loyalty: number
  has_stock: number
  has_reports: number
  has_online_booking: number
  is_public: number
  price: number
}

export interface UsageResponse {
  plan: Plan
  professionals: number
  customers: number
  users: number
}

export function useConfigPlano() {
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadUsage = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await http.get<UsageResponse>("/plan/usage")
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message || "Erro ao carregar dados do plano")
      return
    }
    if (res.data) {
      setUsage(res.data)
    }
  }

  useEffect(() => {
    loadUsage()
  }, [])

  const getProgressValue = (current: number, max: number) => {
    if (max === -1) return 0
    return Math.min((current / max) * 100, 100)
  }

  const getUpgradeWhatsAppLink = () => {
    if (!usage) return ""
    const text = encodeURIComponent(`Olá! Gostaria de falar sobre o upgrade do meu plano no BarberCentral. Minha barbearia: ${usage.plan.name}`)
    return `https://wa.me/5583987972804?text=${text}`
  }

  return {
    usage,
    loading,
    errorMsg,
    getProgressValue,
    getUpgradeWhatsAppLink,
  }
}
