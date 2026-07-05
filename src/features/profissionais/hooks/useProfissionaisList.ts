"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { Professional } from "../types"

// Estado da listagem de profissionais (views desktop e mobile)
export function useProfissionaisList() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadProfessionals = async () => {
    setLoading(true)
    const url = statusFilter ? `/professionals?status=${statusFilter}` : "/professionals"
    const res = await http.get<Professional[]>(url)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setProfessionals(res.data)
    }
  }

  useEffect(() => {
    loadProfessionals()
  }, [statusFilter])

  return { professionals, loading, statusFilter, setStatusFilter, errorMsg }
}
