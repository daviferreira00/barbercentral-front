"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { RevenueReport, OccupancyReport, CustomerReport, CancellationReport } from "../types"

export function useRelatorios() {
  const getFirstDayOfMonth = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]
  }
  const getToday = () => new Date().toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(getToday())
  const [selectedProf, setSelectedProf] = useState("all")
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([])

  // Estado das sub-telas
  const [activeTab, setActiveTab] = useState<"dashboard" | "financeiro" | "ocupacao" | "clientes" | "cancelamentos">("dashboard")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dados carregados
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null)
  const [occupancyData, setOccupancyData] = useState<OccupancyReport | null>(null)
  const [customerData, setCustomerData] = useState<CustomerReport | null>(null)
  const [cancelData, setCancelData] = useState<CancellationReport | null>(null)

  const loadProfessionals = async () => {
    const res = await http.get<{ id: string; name: string }[]>("/professionals")
    if (res.data) setProfessionals(res.data)
  }

  const loadAllReports = async () => {
    setLoading(true)
    setErrorMsg(null)

    const params = `?start_date=${startDate}&end_date=${endDate}`
    const profParam = selectedProf !== "all" ? `&professional_id=${selectedProf}` : ""

    // Carrega em paralelo de forma otimizada
    const [revRes, occRes, custRes, cancRes] = await Promise.all([
      http.get<RevenueReport>(`/reports/revenue${params}${profParam}`),
      http.get<OccupancyReport>(`/reports/occupancy${params}${profParam}`),
      http.get<CustomerReport>(`/reports/customers${params}`),
      http.get<CancellationReport>(`/reports/cancellations${params}`)
    ])

    setLoading(false)

    if (revRes.error && revRes.error.message && revRes.error.message.includes("plan_feature_not_included")) {
      setErrorMsg("Seu plano atual não inclui a funcionalidade de Relatórios. Faça upgrade para ter acesso a relatórios financeiros e operacionais completos!")
      return
    }

    if (revRes.data) setRevenueData(revRes.data)
    if (occRes.data) setOccupancyData(occRes.data)
    if (custRes.data) setCustomerData(custRes.data)
    if (cancRes.data) setCancelData(cancRes.data)
  }

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    loadAllReports()
  }, [startDate, endDate, selectedProf])

  const handleExportCSV = (reportType: string) => {
    const url = `/api/reports/${reportType}/export?start_date=${startDate}&end_date=${endDate}`
    window.open(url, "_blank")
  }

  const handleExportPDF = () => {
    const url = `/api/reports/revenue/pdf?start_date=${startDate}&end_date=${endDate}`
    window.open(url, "_blank")
  }

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedProf,
    setSelectedProf,
    professionals,
    activeTab,
    setActiveTab,
    loading,
    errorMsg,
    revenueData,
    occupancyData,
    customerData,
    cancelData,
    handleExportCSV,
    handleExportPDF,
  }
}
