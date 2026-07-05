"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { CustomerStats, CustomersListResponse } from "../types"

// Estado e ações da listagem de clientes, compartilhados pelas views desktop e mobile
export function useClientesList() {
  const [customers, setCustomers] = useState<CustomerStats[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [birthMonth, setBirthMonth] = useState("0")
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Real-time debounce query state
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reseta para a primeira página quando pesquisa mudar
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const loadCustomers = async () => {
    setLoading(true)
    setErrorMsg(null)

    const queryParam = debouncedSearch ? `&query=${encodeURIComponent(debouncedSearch)}` : ""
    const monthParam = birthMonth !== "0" ? `&birth_month=${birthMonth}` : ""

    const res = await http.get<CustomersListResponse>(
      `/customers?page=${page}&page_size=${pageSize}${queryParam}${monthParam}`
    )
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setCustomers(res.data.data || [])
      setTotal(res.data.total || 0)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [page, debouncedSearch, birthMonth])

  const handleExport = () => {
    // Abre a URL de exportação em nova aba (o navegador gerencia o download do CSV automaticamente)
    window.open("/api/customers/export", "_blank")
  }

  const totalPages = Math.ceil(total / pageSize)

  return {
    customers,
    total,
    totalPages,
    loading,
    errorMsg,
    searchQuery,
    setSearchQuery,
    birthMonth,
    setBirthMonth,
    page,
    setPage,
    pageSize,
    handleExport,
  }
}
