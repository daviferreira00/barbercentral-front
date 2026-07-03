"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  started_at?: string
  services: {
    service_id: string
    service_name: string
    price: number
    duration_minutes: number
  }[]
}

export default function AgendaKdsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Modos de visualização: "columns" (Por profissional) ou "timeline" (Fila Cronológica)
  const [viewMode, setViewMode] = useState<"columns" | "timeline">("columns")
  
  // Relógio em tempo real
  const [currentTime, setCurrentTime] = useState<string>("")
  
  // Timer de atualização automática (segundos)
  const [countdown, setCountdown] = useState<number>(30)
  
  // Modal de Ações Rápidas
  const [selectedApp, setSelectedApp] = useState<EnrichedAppointment | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Helper para formatar data YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Retorna os minutos decorridos desde o início do atendimento
  const getElapsedTime = (startedAtStr?: string) => {
    if (!startedAtStr) return 0
    const start = new Date(startedAtStr)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 1000 / 60)
    return diffMins >= 0 ? diffMins : 0
  }

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const todayStr = formatDateString(new Date())

    try {
      const resProfs = await http.get<Professional[]>("/professionals")
      const resApps = await http.get<EnrichedAppointment[]>(`/appointments?start_date=${todayStr}&end_date=${todayStr}`)
      
      if (resProfs.data) {
        setProfessionals(resProfs.data)
      }
      if (resApps.data) {
        setAppointments(resApps.data)
      }
      if (resApps.error) {
        setErrorMsg(resApps.error.message)
      }
    } catch (e) {
      setErrorMsg("Ocorreu um erro ao carregar os dados do painel.")
    } finally {
      setLoading(false)
    }
  }

  // Efeito para relógio e countdown
  useEffect(() => {
    // Inicializar relógio
    setCurrentTime(new Date().toLocaleTimeString("pt-BR"))
    
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("pt-BR"))
    }, 1000)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    loadData()

    return () => {
      clearInterval(clockInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  // Alteração rápida de status do agendamento
  const handleQuickStatusChange = async (status: string) => {
    if (!selectedApp) return
    setUpdatingStatus(true)
    
    const res = await http.patch(`/appointments/${selectedApp.id}/status`, { 
      status,
      notes: `Status alterado rapidamente pelo Painel KDS às ${new Date().toLocaleTimeString("pt-BR")}`
    })
    
    setUpdatingStatus(false)
    if (res.error) {
      alert(`Erro ao atualizar status: ${res.error.message}`)
      return
    }
    
    setSelectedApp(null)
    loadData()
  }

  // Estilos visuais baseados no status do agendamento
  const getStatusVisuals = (status: string) => {
    switch (status) {
      case "pending":
        return {
          border: "border-l-4 border-l-slate-400 bg-slate-900/60 border-slate-800",
          badge: "bg-slate-800 text-slate-300 border-slate-700",
          label: "Pendente"
        }
      case "confirmed":
        return {
          border: "border-l-4 border-l-blue-500 bg-blue-950/20 border-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.08)]",
          badge: "bg-blue-900/40 text-blue-300 border-blue-800/60",
          label: "Confirmado"
        }
      case "in_progress":
        return {
          border: "border-l-4 border-l-amber-500 bg-amber-950/30 border-amber-900/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          badge: "bg-amber-500 text-slate-950 font-extrabold",
          label: "Em Atendimento"
        }
      case "completed":
        return {
          border: "border-l-4 border-l-emerald-500 bg-emerald-950/10 border-emerald-950/30 opacity-50",
          badge: "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
          label: "Concluído"
        }
      case "cancelled":
        return {
          border: "border-l-4 border-l-red-500 bg-red-950/10 border-red-950/30 opacity-40 line-through",
          badge: "bg-red-900/30 text-red-400 border-red-800/40",
          label: "Cancelado"
        }
      case "no_show":
        return {
          border: "border-l-4 border-l-rose-700 bg-rose-950/10 border-rose-950/30 opacity-40",
          badge: "bg-rose-900/30 text-rose-400 border-rose-800/40",
          label: "Falta"
        }
      default:
        return {
          border: "border-l-4 border-l-slate-600 bg-slate-900 border-slate-800",
          badge: "bg-slate-800 text-slate-300 border-slate-700",
          label: status
        }
    }
  }

  // Renderizador de cartões de agendamento
  const renderAppointmentCard = (app: EnrichedAppointment) => {
    const visuals = getStatusVisuals(app.status)
    const totalDuration = app.services?.reduce((acc, curr) => acc + curr.duration_minutes, 0) || 0
    const servicesText = app.services?.map((s) => s.service_name).join(", ") || "Sem serviços"

    return (
      <div
        key={app.id}
        onClick={() => setSelectedApp(app)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex flex-col gap-2.5 ${visuals.border}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 font-bold">{app.start_time} - {app.end_time}</span>
            <h4 className="text-base font-extrabold text-white tracking-wide truncate max-w-[170px] md:max-w-[220px]">
              {app.customer_name || "Cliente sem Nome"}
            </h4>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${visuals.badge}`}>
            {visuals.label}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-slate-800/60 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <i className="ti ti-cut text-indigo-400 text-sm" />
            <span className="font-semibold line-clamp-1">{servicesText}</span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5 font-medium">
            {app.status === "in_progress" ? (
              <span className="flex items-center gap-1 text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <i className="ti ti-clock" />
                {getElapsedTime(app.started_at)} min
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <i className="ti ti-clock text-slate-500" />
                {totalDuration} min
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <i className="ti ti-user text-slate-500" />
              {app.professional_name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Filtragem de agendamentos por profissional
  const getAppointmentsForProf = (profId: string) => {
    return appointments
      .filter((app) => app.professional_id === profId)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Agendamentos sem profissional (caso haja)
  const getUnassignedAppointments = () => {
    return appointments
      .filter((app) => !app.professional_id)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Agendamentos ordenados por tempo geral para a timeline
  const getTimelineAppointments = () => {
    return [...appointments].sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Estatísticas de topo
  const totalToday = appointments.length
  const pendingCount = appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length
  const activeCount = appointments.filter((a) => a.status === "in_progress").length
  const completedCount = appointments.filter((a) => a.status === "completed").length

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans p-6">
      
      {/* 1. CABEÇALHO DO KDS */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="ti ti-device-tv text-white text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wider uppercase">Painel KDS Central</h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Monitoramento de Atendimentos
            </p>
          </div>
        </div>

        {/* Relógio Digital Centralizado/Destacado */}
        <div className="flex items-center justify-center bg-slate-900/60 border border-slate-800/80 rounded-2xl px-6 py-2 shadow-inner">
          <span className="text-2xl font-black font-mono tracking-widest text-slate-200">
            {currentTime || "00:00:00"}
          </span>
        </div>

        {/* Controles de Configuração e Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-800 rounded-lg p-0.5 bg-slate-900/40">
            <button
              onClick={() => setViewMode("columns")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition ${
                viewMode === "columns"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <i className="ti ti-columns mr-1.5 text-sm" />
              Por Barbeiro
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition ${
                viewMode === "timeline"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <i className="ti ti-timeline mr-1.5 text-sm" />
              Fila Cronológica
            </button>
          </div>

          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white h-9 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <i className="ti ti-refresh text-sm animate-spin-slow" />
            Recarregar ({countdown}s)
          </Button>

          <Link href="/cliente/agenda">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-900 h-9 font-bold flex items-center gap-1"
            >
              <i className="ti ti-arrow-left text-sm" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. BARRA DE CARDS E KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-900/50">
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Hoje</span>
          <span className="text-xl font-extrabold text-white mt-1">{totalToday}</span>
        </div>
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 flex flex-col border-l-2 border-l-blue-500">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-blue-400">Próximos / Pendentes</span>
          <span className="text-xl font-extrabold text-white mt-1">{pendingCount}</span>
        </div>
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 flex flex-col border-l-2 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-amber-400">Em Atendimento</span>
          <span className="text-xl font-extrabold text-white mt-1">{activeCount}</span>
        </div>
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 flex flex-col border-l-2 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-emerald-400">Finalizados</span>
          <span className="text-xl font-extrabold text-white mt-1">{completedCount}</span>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL (COM SCROLL INTERNO INDEPENDENTE) */}
      <main className="flex-1 overflow-hidden py-5">
        {loading && appointments.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-sm font-bold text-slate-500">Carregando painel KDS...</span>
          </div>
        ) : errorMsg ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 p-4 text-center">
            <i className="ti ti-alert-triangle text-3xl text-rose-500" />
            <span className="text-sm font-semibold text-slate-400 max-w-md">{errorMsg}</span>
            <Button onClick={loadData} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Tentar Novamente
            </Button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-center text-slate-500">
            <i className="ti ti-calendar-off text-4xl" />
            <p className="text-base font-bold">Nenhum agendamento programado para hoje.</p>
            <p className="text-xs">Novos agendamentos aparecerão automaticamente neste painel.</p>
          </div>
        ) : viewMode === "columns" ? (
          /* MODO COLUNAS (KANBAN POR BARBEIRO) */
          <div className="flex gap-5 h-full overflow-x-auto pb-4 scrollbar-thin select-none">
            {/* Coluna para agendamentos sem profissional */}
            {getUnassignedAppointments().length > 0 && (
              <div className="flex-shrink-0 w-80 flex flex-col bg-slate-900/25 border border-slate-900 rounded-2xl p-4 overflow-hidden h-full">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">Sem Profissional</h3>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                    {getUnassignedAppointments().length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-none pr-1">
                  {getUnassignedAppointments().map(renderAppointmentCard)}
                </div>
              </div>
            )}

            {/* Colunas dos Profissionais cadastrados */}
            {professionals.map((prof) => {
              const profApps = getAppointmentsForProf(prof.id)
              const profAppsActive = profApps.filter((a) => a.status === "in_progress").length
              
              return (
                <div key={prof.id} className="flex-shrink-0 w-80 flex flex-col bg-slate-900/20 border border-slate-900/60 rounded-2xl p-4 overflow-hidden h-full">
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-900/80">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider truncate max-w-[200px]">
                        {prof.name}
                      </h3>
                      {profAppsActive > 0 && (
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                          Em Atendimento
                        </span>
                      )}
                    </div>
                    <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                      {profApps.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-none pr-1">
                    {profApps.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center gap-1 p-4 border border-dashed border-slate-900 rounded-xl">
                        <i className="ti ti-user-x text-2xl" />
                        <span className="text-xs font-bold uppercase">Sem agenda</span>
                      </div>
                    ) : (
                      profApps.map(renderAppointmentCard)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* MODO TIMELINE (FILA CRONOLÓGICA) */
          <div className="h-full overflow-y-auto max-w-3xl mx-auto bg-slate-900/10 border border-slate-900 p-6 rounded-2xl shadow-inner scrollbar-thin">
            <div className="flex flex-col gap-4">
              {getTimelineAppointments().map((app) => (
                <div key={app.id} className="flex gap-4 items-stretch">
                  {/* Hora na lateral esquerda */}
                  <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl min-w-[90px]">
                    <span className="text-sm font-black text-white">{app.start_time}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Início</span>
                  </div>
                  
                  {/* Card Completo */}
                  <div className="flex-1">
                    {renderAppointmentCard(app)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. DIALOG DE AÇÕES RÁPIDAS */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md w-full rounded-2xl shadow-2xl p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-lg font-black text-white tracking-wide flex items-center gap-2">
              <i className="ti ti-info-circle text-indigo-500 text-xl" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="py-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cliente</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.customer_name || "N/A"}</p>
                  {selectedApp.customer_phone && (
                    <p className="text-xs text-slate-400 mt-0.5">{selectedApp.customer_phone}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profissional (Barbeiro)</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.professional_name}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Serviços Contratados</span>
                <div className="bg-slate-950/20 rounded-xl border border-slate-850 p-3 flex flex-col gap-2">
                  {selectedApp.services?.map((svc, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300">{svc.service_name}</span>
                      <span className="text-slate-400">R$ {svc.price.toFixed(2)} ({svc.duration_minutes} min)</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800/80 pt-2 mt-1 flex justify-between items-center text-xs font-bold text-white">
                    <span>Total</span>
                    <span>
                      R$ {selectedApp.services?.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Horário Previsto</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.start_time} até {selectedApp.end_time}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Atual</span>
                  <p className="font-extrabold text-white mt-0.5 capitalize flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${
                      selectedApp.status === "in_progress" ? "bg-amber-500" :
                      selectedApp.status === "completed" ? "bg-emerald-500" :
                      selectedApp.status === "confirmed" ? "bg-blue-500" :
                      selectedApp.status === "pending" ? "bg-slate-500" : "bg-red-500"
                    }`}></span>
                    {getStatusVisuals(selectedApp.status).label}
                  </p>
                </div>
              </div>

              {/* Botões de Ações Rápidas */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Controle de Atendimento KDS
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleQuickStatusChange("in_progress")}
                    disabled={updatingStatus || selectedApp.status === "in_progress"}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-11 flex items-center justify-center gap-1.5 border-none cursor-pointer"
                  >
                    <i className="ti ti-play text-base" />
                    Iniciar Atendimento
                  </Button>

                  <Button
                    onClick={() => handleQuickStatusChange("completed")}
                    disabled={updatingStatus || selectedApp.status === "completed"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 flex items-center justify-center gap-1.5 border-none cursor-pointer"
                  >
                    <i className="ti ti-checkbox text-base" />
                    Concluir Atendimento
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleQuickStatusChange("confirmed")}
                    disabled={updatingStatus || selectedApp.status === "confirmed"}
                    variant="outline"
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-bold h-9 cursor-pointer"
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => handleQuickStatusChange("no_show")}
                    disabled={updatingStatus || selectedApp.status === "no_show"}
                    variant="outline"
                    className="border-rose-950/60 bg-rose-950/10 hover:bg-rose-950/20 text-rose-300 text-xs font-bold h-9 cursor-pointer"
                  >
                    Falta (No-Show)
                  </Button>
                  <Button
                    onClick={() => handleQuickStatusChange("cancelled")}
                    disabled={updatingStatus || selectedApp.status === "cancelled"}
                    variant="outline"
                    className="border-red-950/60 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-xs font-bold h-9 cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 pt-2 border-t border-slate-800">
            <Button
              onClick={() => setSelectedApp(null)}
              variant="outline"
              className="w-full border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white font-bold h-10 cursor-pointer"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
}
