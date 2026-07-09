"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"

export type AppointmentStatus = "Confirmado" | "Concluído" | "Pendente"

export interface UpcomingAppointment {
  customer: string
  time: string
  professional: string
  services: string
  status: AppointmentStatus
  date: string
}

export interface DashboardData {
  appointmentsToday: number
  appointmentsDone: number
  cashToday: string
  occupancyRate: string
  upcoming: UpcomingAppointment[]
  loading: boolean
  clientSlug: string
}

export function useDashboard(): DashboardData {
  const [appointmentsToday, setAppointmentsToday] = useState(0)
  const [appointmentsDone, setAppointmentsDone] = useState(0)
  const [cashToday, setCashToday] = useState("R$ 0,00")
  const [occupancyRate, setOccupancyRate] = useState("0%")
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [clientSlug, setClientSlug] = useState("")

  const getTodayStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const loadDashboardData = async () => {
    setLoading(true)
    const today = getTodayStr()

    // 1. Busca agendamentos de hoje
    const appRes = await http.get<any[]>(`/appointments?start_date=${today}&end_date=${today}`)
    
    // 2. Busca receita de hoje (ignora se plano bloquear)
    const revRes = await http.get<any>(`/reports/revenue?start_date=${today}&end_date=${today}`)
    
    // 3. Busca ocupação de hoje (ignora se plano bloquear)
    const occRes = await http.get<any>(`/reports/occupancy?start_date=${today}&end_date=${today}`)

    // 4. Slug da barbearia ativa (para o link do portal público)
    const brandRes = await http.get<any>(`/config/branding`)

    setLoading(false)

    if (brandRes.data?.client_slug) {
      setClientSlug(brandRes.data.client_slug)
    }

    // Agendamentos
    if (appRes.data) {
      const list = appRes.data
      setAppointmentsToday(list.length)
      
      const doneCount = list.filter((a: any) => a.status === "completed").length
      setAppointmentsDone(doneCount)

      const upcomingList: UpcomingAppointment[] = list.map((a: any) => {
        let displayStatus: AppointmentStatus = "Pendente"
        if (a.status === "completed") displayStatus = "Concluído"
        else if (a.status === "confirmed") displayStatus = "Confirmado"

        const tStart = a.start_time ? a.start_time.substring(0, 5) : ""
        const tEnd = a.end_time ? a.end_time.substring(0, 5) : ""

        let formattedDate = ""
        if (a.date) {
          const parts = a.date.split("T")[0].split("-")
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
          }
        }

        return {
          customer: a.customer_name || "Sem cadastro",
          time: tStart && tEnd ? `${tStart} - ${tEnd}` : "",
          professional: a.professional_name || "Geral",
          services: (a.services || []).map((s: any) => s.service_name || s.name).join(" + "),
          status: displayStatus,
          date: formattedDate
        }
      })
      
      // Ordena por horário
      upcomingList.sort((a, b) => a.time.localeCompare(b.time))
      setUpcoming(upcomingList)
    }

    // Receita
    if (revRes.data && typeof revRes.data.total_revenue === "number") {
      setCashToday(`R$ ${revRes.data.total_revenue.toFixed(2)}`)
    } else {
      setCashToday("R$ 0,00")
    }

    // Ocupação
    if (occRes.data && typeof occRes.data.occupancy_rate === "number") {
      setOccupancyRate(`${occRes.data.occupancy_rate.toFixed(0)}%`)
    } else {
      setOccupancyRate("0%")
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return {
    appointmentsToday,
    appointmentsDone,
    cashToday,
    occupancyRate,
    upcoming,
    loading,
    clientSlug,
  }
}
