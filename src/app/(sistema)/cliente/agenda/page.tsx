"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Professional {
  id: string
  name: string
}

interface EnrichedAppointment {
  id: string
  professional_id: string
  professional_name: string
  customer_id?: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  date: string
  start_time: string
  end_time: string
  status: string // pending, confirmed, in_progress, completed, cancelled, no_show
  notes?: string
  services: {
    service_id: string
    service_name: string
    price: number
    duration_minutes: number
  }[]
}

interface BlockedSlot {
  id: string
  professional_id?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
}

const VIEW_MODES = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
]

export default function ClienteAgendaPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfId, setSelectedProfId] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-06-29")) // Defasado para o dia do seed
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
    if (res.data) {
      setProfessionals(res.data)
    }
  }

  // Helper para formatar data YYYY-MM-DD
  const formatDateString = (d: Date) => {
    return d.toISOString().split("T")[0]
  }

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
    if (isEditing && editProfId && editDate && selectedApp) {
      setLoadingEditSlots(true)
      const svcParam = selectedApp.services.map((s) => `service_ids=${s.service_id}`).join("&")
      http.get<any[]>(`/appointments/availability?date=${editDate}&professional_id=${editProfId}&${svcParam}`).then((res) => {
        setLoadingEditSlots(false)
        if (res.data) setEditSlots(res.data)
      })
    } else {
      setEditSlots([])
    }
  }, [isEditing, editProfId, editDate])

  const navigateDate = (dir: "prev" | "next" | "today") => {
    const d = new Date(currentDate)
    if (dir === "today") {
      setCurrentDate(new Date("2026-06-29")) // Hoje fixa na segunda do seed
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
    const totalAmount = selectedApp.services.reduce((acc: number, curr: any) => acc + curr.price, 0)

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
    if (!selectedApp || !editProfId || !editDate || !editTime) return

    setUpdatingStatus(true)
    const res = await http.put(`/appointments/${selectedApp.id}`, {
      professional_id: editProfId,
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

  // Helpers de Estilos por Status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100"
      case "no_show":
        return "bg-red-950/5 text-red-900 border-red-900/10"
      default:
        return "bg-slate-50 text-slate-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "confirmed":
        return "Confirmado"
      case "in_progress":
        return "Em Atendimento"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      case "no_show":
        return "Falta (No-show)"
      default:
        return status
    }
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

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header agenda controls */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigateDate("prev")} className="border border-slate-200 h-9 px-3">
            <i className="ti ti-chevron-left text-base" />
          </Button>
          <Button variant="ghost" onClick={() => navigateDate("today")} className="border border-slate-200 h-9 text-xs font-bold uppercase">
            Hoje
          </Button>
          <Button variant="ghost" onClick={() => navigateDate("next")} className="border border-slate-200 h-9 px-3">
            <i className="ti ti-chevron-right text-base" />
          </Button>
          <span className="text-sm font-bold text-slate-800 capitalize pl-1">
            {getHeaderDateLabel()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Profissional */}
          <Select value={selectedProfId} onValueChange={setSelectedProfId}>
            <SelectTrigger className="w-52 h-9 text-xs font-semibold">
              <SelectValue placeholder="Filtrar Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos Profissionais</SelectItem>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Toggle Modo Dia/Semana */}
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === mode.value
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <a href="/cliente/agenda/bloqueios">
            <Button size="sm" variant="ghost" className="border border-slate-200 bg-white h-9 font-semibold flex items-center gap-1">
              <i className="ti ti-lock text-sm" />
              Bloquear Horário
            </Button>
          </a>

          <Link href="/cliente/agenda/novo">
            <Button size="sm" className="h-9 font-semibold flex items-center gap-1 bg-slate-900 text-white">
              <i className="ti ti-plus text-sm" />
              Novo Agendamento
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Visualização de Agenda */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-bold mt-2">Buscando horários da agenda...</span>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === "day" ? (
            // Day view timeline
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals
                .filter((p) => !selectedProfId || p.id === selectedProfId)
                .map((prof) => {
                  const profApps = appointments.filter((a) => a.professional_id === prof.id)
                  const profBlocks = blockedSlots.filter((b) => !b.professional_id || b.professional_id === prof.id)

                  return (
                    <Card key={prof.id} className="border-slate-100 flex flex-col min-h-[450px]">
                      <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
                        <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                            {prof.name[0]}
                          </div>
                          {prof.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 space-y-3 bg-slate-50/20">
                        {/* Exibe bloqueios daquele dia */}
                        {profBlocks.map((block) => (
                          <div
                            key={block.id}
                            className="bg-slate-200/50 border border-dashed border-slate-300 text-slate-500 rounded-xl p-3 text-xs flex items-center gap-2 font-semibold"
                          >
                            <i className="ti ti-lock text-sm" />
                            <div>
                              <p className="font-bold">
                                {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                              </p>
                              <p className="text-[10px] text-slate-400">Bloqueio: {block.reason || "Indisponível"}</p>
                            </div>
                          </div>
                        ))}

                        {profApps.length === 0 && profBlocks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24 text-center">
                            <i className="ti ti-calendar-event text-4xl mb-2" />
                            <span className="text-xs font-bold">Sem compromissos hoje</span>
                          </div>
                        ) : (
                          profApps.map((app) => (
                            <div
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className={`border rounded-xl p-3.5 shadow-sm hover:shadow transition duration-150 cursor-pointer flex flex-col gap-2 font-sans ${getStatusStyle(
                                app.status
                              )}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold leading-none">
                                  {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  {getStatusLabel(app.status)}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                                {app.customer_name || "Cliente Avulso"}
                              </p>
                              <div className="flex justify-between items-center text-[10px] text-slate-500/80 font-bold border-t border-slate-200/50 pt-2 mt-1">
                                <span className="truncate max-w-[120px]">
                                  {app.services.map((s) => s.service_name).join(", ")}
                                </span>
                                <span>
                                  R$ {app.services.reduce((acc, s) => acc + s.price, 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          ) : (
            // Week view timeline
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, idx) => {
                const dayOfWeek = currentDate.getDay()
                const start = new Date(currentDate)
                const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // ajusta para segunda
                start.setDate(diff + idx)

                const dayStr = formatDateString(start)
                const dayApps = appointments.filter((a) => a.date === dayStr)

                const isToday = formatDateString(new Date()) === dayStr

                return (
                  <Card key={idx} className={`border-slate-100 flex flex-col min-h-[350px] ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-2.5 px-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {start.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </p>
                      <p className="text-base font-extrabold text-slate-800 leading-none mt-1">
                        {start.getDate()}
                      </p>
                    </CardHeader>
                    <CardContent className="p-2 flex-1 space-y-2 bg-slate-50/10">
                      {dayApps.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16 text-center">
                          <span className="text-[10px] font-bold">Sem agendamentos</span>
                        </div>
                      ) : (
                        dayApps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`border rounded-lg p-2 shadow-sm hover:shadow transition duration-150 cursor-pointer flex flex-col gap-1 text-[11px] font-sans ${getStatusStyle(
                              app.status
                            )}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{app.start_time.substring(0, 5)}</span>
                              <span className="text-[8px] font-bold uppercase">{getStatusLabel(app.status)}</span>
                            </div>
                            <p className="font-extrabold text-slate-900 truncate leading-none">
                              {app.customer_name || "Cliente Avulso"}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate leading-none">
                              Pro: {app.professional_name.split(" ")[0]}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate leading-none">
                              {app.services.map((s) => s.service_name).join(", ")}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={selectedApp !== null} onOpenChange={(open) => !open && setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Reagendar Agendamento" : isCancellingWithReason ? "Confirmar Cancelamento" : "Detalhes do Agendamento"}
              </DialogTitle>
            </DialogHeader>

            {/* MODO CANCELAMENTO COM MOTIVO */}
            {isCancellingWithReason ? (
              <form onSubmit={handleCancelWithReason} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Motivo do Cancelamento (Obrigatório)</label>
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Descreva o motivo do cancelamento para registro administrativo..."
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsCancellingWithReason(false)}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={updatingStatus} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    Confirmar Cancelamento
                  </Button>
                </div>
              </form>
            ) : isEditing ? (
              /* MODO REAGENDAMENTO / EDIÇÃO */
              <form onSubmit={handleReschedule} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Profissional</label>
                    <Select
                      value={editProfId}
                      onValueChange={(val) => {
                        setEditProfId(val)
                        setEditTime("")
                      }}
                    >
                      <SelectTrigger className="text-xs font-semibold">
                        <SelectValue placeholder="Profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => {
                        setEditDate(e.target.value)
                        setEditTime("")
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>

                {editDate && editProfId && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase block">Novo Horário</label>
                    {loadingEditSlots ? (
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : editSlots.length === 0 ? (
                      <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 p-2 rounded">
                        Sem horários disponíveis para este dia.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-0.5">
                        {editSlots.map((slot) => (
                          <Button
                            key={slot.start_time}
                            type="button"
                            variant="ghost"
                            onClick={() => setEditTime(slot.start_time)}
                            className={`h-8 text-[10px] font-bold border ${
                              editTime === slot.start_time
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            {slot.start_time.substring(0, 5)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updatingStatus || !editTime} className="font-bold">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            ) : (
              /* MODO VISUALIZAÇÃO PADRÃO */
              <div className="space-y-4 py-2 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                    <p className="font-bold text-slate-800 text-sm flex items-center">
                      {selectedApp.customer_name || "Cliente Avulso"}
                      {selectedApp.customer_id && (
                        <Link
                          href={`/cliente/clientes/${selectedApp.customer_id}`}
                          className="text-indigo-600 hover:underline text-[9px] font-extrabold pl-1.5 border-l border-slate-200 ml-1.5"
                        >
                          Ver CRM
                        </Link>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedApp.customer_phone || "Sem telefone"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional / Horário</span>
                    <p className="font-bold text-slate-800">{selectedApp.professional_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {new Date(selectedApp.date + "T00:00:00").toLocaleDateString("pt-BR")} às {selectedApp.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Serviços Contratados</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                    {selectedApp.services.map((s) => (
                      <div key={s.service_id} className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-700">{s.service_name} ({s.duration_minutes} min)</span>
                        <span className="font-bold text-slate-800">R$ {s.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200/50 pt-1.5 flex justify-between items-center font-extrabold text-slate-800">
                      <span>Total Estimado</span>
                      <span>R$ {selectedApp.services.reduce((acc, s) => acc + s.price, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Observações</span>
                    <p className="bg-slate-50 border border-slate-100 p-2 rounded text-slate-600 italic">
                      {selectedApp.notes}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status do Agendamento</span>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusStyle(selectedApp.status)}`}>
                      {getStatusLabel(selectedApp.status)}
                    </span>
                  </div>
                </div>

                {/* TIMELINE DE LOGS DE STATUS */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Histórico de Alterações</span>
                  {loadingLogs ? (
                    <div className="text-[10px] text-slate-400">Carregando timeline...</div>
                  ) : statusLogs.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic">Nenhum histórico registrado.</div>
                  ) : (
                    <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                      {statusLogs.map((log) => (
                        <div key={log.id} className="relative pl-4 border-l border-slate-200 text-[10px] leading-relaxed">
                          {/* Dot indicador */}
                          <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-slate-400 border border-white" />
                          <div className="font-bold text-slate-700">
                            Status alterado para{" "}
                            <span className="text-slate-900 uppercase font-black text-[9px] bg-slate-100 px-1 py-0.5 rounded border">
                              {getStatusLabel(log.to_status)}
                            </span>
                          </div>
                          {log.notes && <div className="text-slate-500 italic mt-0.5">Motivo: "{log.notes}"</div>}
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer de botões padrão do Modal */}
            {!isEditing && !isCancellingWithReason && (
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5 justify-start flex-1">
                  {selectedApp.status !== "completed" && selectedApp.status !== "cancelled" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("confirmed", "Confirmado pelo recepcionista")}
                        disabled={updatingStatus}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("in_progress", "Profissional iniciou o atendimento")}
                        disabled={updatingStatus}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCheckoutMethod("cash")
                          setCheckoutNotes("")
                          setCheckoutModalOpen(true)
                        }}
                        disabled={updatingStatus}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("no_show", "Cliente não compareceu")}
                        disabled={updatingStatus}
                        className="bg-red-950/5 text-red-950 hover:bg-red-950/10 text-[10px] font-bold h-8 px-2.5"
                      >
                        Falta
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditProfId(selectedApp.professional_id)
                          setEditDate(selectedApp.date)
                          setEditTime(selectedApp.start_time.substring(0, 5))
                          setIsEditing(true)
                        }}
                        disabled={updatingStatus}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold h-8 px-2.5"
                      >
                        Reagendar
                      </Button>
                    </>
                  )}
                  {selectedApp.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCancelReason("")
                        setIsCancellingWithReason(true)
                      }}
                      disabled={updatingStatus}
                      className="bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold h-8 px-2.5"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <Button type="button" variant="ghost" onClick={() => setSelectedApp(null)} disabled={updatingStatus}>
                  Fechar
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* MODAL CHECKOUT DE PAGAMENTO */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        {selectedApp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Finalizar Atendimento e Checkout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCheckout} className="space-y-4 py-2">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedApp.customer_name || "Sem cadastro"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Profissional:</span>
                  <span className="font-bold text-slate-800">{selectedApp.professional_name}</span>
                </div>
                <div className="flex justify-between items-center font-extrabold border-t border-slate-200/50 pt-2 text-slate-800 text-sm">
                  <span>Total a Pagar:</span>
                  <span className="text-primary text-base font-black">
                    R$ {selectedApp.services.reduce((acc: number, curr: any) => acc + curr.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Forma de Pagamento</label>
                <Select value={checkoutMethod} onValueChange={setCheckoutMethod}>
                  <SelectTrigger className="text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="card_debit">Cartão de Débito</SelectItem>
                    <SelectItem value="card_credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Observações / Notas</label>
                <textarea
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Lançar observações sobre gorjetas ou facilidades de pagamento..."
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setCheckoutModalOpen(false)}>
                  Voltar
                </Button>
                <Button type="submit" disabled={updatingStatus} className="font-bold">
                  {updatingStatus ? "Processando..." : "Confirmar Recebimento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
