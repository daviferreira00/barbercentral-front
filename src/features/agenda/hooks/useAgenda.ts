"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import {
  type Professional,
  type EnrichedAppointment,
  type BlockedSlot,
  formatDateString,
  cleanDate,
} from "../types"

interface AgendaService {
  id: string
  name: string
  duration_minutes: number
  price: number
}

// Estado e ações da agenda, compartilhados pelas views desktop e mobile
export function useAgenda() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<AgendaService[]>([])
  const [selectedProfId, setSelectedProfId] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("day")

  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modal Detalhes do Agendamento
  const [selectedApp, setSelectedApp] = useState<EnrichedAppointment | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Estados FASE-05 / FASE-06
  const [statusLogs, setStatusLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editProfId, setEditProfId] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editServiceIds, setEditServiceIds] = useState<string[]>([])
  const [editSlots, setEditSlots] = useState<any[]>([])
  const [loadingEditSlots, setLoadingEditSlots] = useState(false)

  const [isCancellingWithReason, setIsCancellingWithReason] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Checkout e Pagamentos (FASE-07 / FASE-08)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutMethod, setCheckoutMethod] = useState("cash")
  const [checkoutNotes, setCheckoutNotes] = useState("")

  const loadFilterData = async () => {
    const res = await http.get<Professional[]>("/professionals")
    const resServices = await http.get<AgendaService[]>("/services")
    if (res.data) {
      setProfessionals(res.data)
    }
    if (resServices.data) setServices(resServices.data)
  }

  const activeDateStr = formatDateString(currentDate)

  const loadAgenda = async () => {
    setLoading(true)
    setErrorMsg(null)

    const dateStr = formatDateString(currentDate)

    // Se for week view, pega o range da semana (Segunda a Domingo)
    let startStr = dateStr
    let endStr = dateStr

    if (viewMode === "week") {
      const dayOfWeek = currentDate.getDay() // 0=Dom, 1=Seg...
      const start = new Date(currentDate)
      const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // ajusta para segunda
      start.setDate(diff)

      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      startStr = formatDateString(start)
      endStr = formatDateString(end)
    }

    const profQuery = selectedProfId ? `&professional_id=${selectedProfId}` : ""

    const resApp = await http.get<EnrichedAppointment[]>(`/appointments?start_date=${startStr}&end_date=${endStr}${profQuery}`)
    const resBlock = await http.get<BlockedSlot[]>(`/blocked-slots?start_date=${startStr}&end_date=${endStr}${profQuery}`)
    setLoading(false)

    if (resApp.error) {
      setErrorMsg(resApp.error.message)
      return
    }

    if (resApp.data) setAppointments(resApp.data)
    if (resBlock.data) setBlockedSlots(resBlock.data)
  }

  useEffect(() => {
    loadFilterData()
  }, [])

  useEffect(() => {
    loadAgenda()
  }, [currentDate, selectedProfId, viewMode])

  // Carrega logs de status ao abrir o modal
  useEffect(() => {
    if (selectedApp) {
      setLoadingLogs(true)
      http.get<any[]>(`/appointments/${selectedApp.id}/logs`).then((res) => {
        setLoadingLogs(false)
        if (res.data) setStatusLogs(res.data)
      })
    } else {
      setStatusLogs([])
      setIsEditing(false)
      setIsCancellingWithReason(false)
      setCancelReason("")
    }
  }, [selectedApp])

  // Busca slots livres para reagendamento
  useEffect(() => {
    if (isEditing && editProfId && editDate && editServiceIds.length > 0) {
      setLoadingEditSlots(true)
      const svcParam = editServiceIds.map((id) => `service_ids=${id}`).join("&")
      http.get<any[]>(`/appointments/availability?date=${editDate}&professional_id=${editProfId}&${svcParam}`).then((res) => {
        setLoadingEditSlots(false)
        if (res.data) {
          const originalTime = selectedApp?.start_time.substring(0, 5)
          const keepsOriginalPosition = editProfId === selectedApp?.professional_id && editDate === cleanDate(selectedApp?.date)
          const slots = [...res.data]
          if (keepsOriginalPosition && originalTime && !slots.some((slot) => slot.start_time.substring(0, 5) === originalTime)) {
            slots.push({ start_time: originalTime, end_time: selectedApp?.end_time.substring(0, 5) })
            slots.sort((a, b) => a.start_time.localeCompare(b.start_time))
          }
          setEditSlots(slots)
        }
      })
    } else {
      setEditSlots([])
    }
  }, [isEditing, editProfId, editDate, editServiceIds])

  const toggleEditService = (id: string) => {
    setEditServiceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setEditTime("")
  }

  const navigateDate = (dir: "prev" | "next" | "today") => {
    const d = new Date(currentDate)
    if (dir === "today") {
      setCurrentDate(new Date())
    } else {
      const step = viewMode === "day" ? 1 : 7
      d.setDate(currentDate.getDate() + (dir === "next" ? step : -step))
      setCurrentDate(d)
    }
  }

  const changeStatus = async (status: string, notes: string = "") => {
    if (!selectedApp) return
    setUpdatingStatus(true)
    const res = await http.patch(`/appointments/${selectedApp.id}/status`, { status, notes: notes ? notes : null })
    setUpdatingStatus(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setSelectedApp(null)
    loadAgenda()
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    setUpdatingStatus(true)
    const totalAmount = (selectedApp.services || []).reduce((acc: number, curr: any) => acc + curr.price, 0)

    // 1. Muda status do agendamento para concluído
    const resStatus = await http.patch(`/appointments/${selectedApp.id}/status`, {
      status: "completed",
      notes: checkoutNotes ? checkoutNotes : "Atendimento finalizado com sucesso"
    })

    if (resStatus.error) {
      alert(resStatus.error.message)
      setUpdatingStatus(false)
      return
    }

    // 2. Registra o pagamento do agendamento
    const resPay = await http.post(`/appointments/${selectedApp.id}/payment`, {
      amount: totalAmount,
      method: checkoutMethod,
      notes: checkoutNotes ? checkoutNotes : null
    })

    setUpdatingStatus(false)
    setCheckoutModalOpen(false)
    setSelectedApp(null)
    loadAgenda()

    if (resPay.error) {
      alert(`O atendimento foi finalizado, mas houve erro ao registrar o pagamento no caixa aberto: ${resPay.error.message}`)
    }
  }

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp || !editProfId || !editDate || !editTime || editServiceIds.length === 0) return

    setUpdatingStatus(true)
    const res = await http.put(`/appointments/${selectedApp.id}`, {
      professional_id: editProfId,
      service_ids: editServiceIds,
      date: editDate,
      start_time: editTime,
    })
    setUpdatingStatus(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsEditing(false)
    setSelectedApp(null)
    loadAgenda()
  }

  const handleCancelWithReason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    setUpdatingStatus(true)
    const res = await http.delete(`/appointments/${selectedApp.id}`, {
      reason: cancelReason,
    })
    setUpdatingStatus(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsCancellingWithReason(false)
    setSelectedApp(null)
    loadAgenda()
  }

  const getWeekDays = () => {
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday...
    const start = new Date(currentDate)
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust to Monday
    start.setDate(diff)

    const list = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      list.push(day)
    }
    return list
  }

  // Formatador de Data de exibição no header
  const getHeaderDateLabel = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } else {
      const dayOfWeek = currentDate.getDay()
      const start = new Date(currentDate)
      const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      start.setDate(diff)

      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      return `Semana de ${start.getDate()}/${start.getMonth() + 1} a ${end.getDate()}/${end.getMonth() + 1}`
    }
  }

  return {
    professionals,
    services,
    selectedProfId,
    setSelectedProfId,
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    appointments,
    blockedSlots,
    loading,
    errorMsg,
    activeDateStr,
    selectedApp,
    setSelectedApp,
    updatingStatus,
    statusLogs,
    loadingLogs,
    isEditing,
    setIsEditing,
    editProfId,
    setEditProfId,
    editDate,
    setEditDate,
    editTime,
    setEditTime,
    editServiceIds,
    setEditServiceIds,
    toggleEditService,
    editSlots,
    loadingEditSlots,
    isCancellingWithReason,
    setIsCancellingWithReason,
    cancelReason,
    setCancelReason,
    checkoutModalOpen,
    setCheckoutModalOpen,
    checkoutMethod,
    setCheckoutMethod,
    checkoutNotes,
    setCheckoutNotes,
    navigateDate,
    changeStatus,
    handleCheckout,
    handleReschedule,
    handleCancelWithReason,
    getWeekDays,
    getHeaderDateLabel,
  }
}
