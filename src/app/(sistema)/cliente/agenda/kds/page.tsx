"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface ClientConfig {
  client_id: string
  logo_url?: string
  logo_central?: string
  color_primary: string
  color_secondary: string
  color_button?: string
  background_type?: string
  font_family: string
  kds_pin?: string
}

export default function AgendaKdsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([])
  const [config, setConfig] = useState<ClientConfig | null>(null)
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

  // PIN prompt state
  const [pinPromptAction, setPinPromptAction] = useState<{ status: string } | null>(null)
  const [enteredPin, setEnteredPin] = useState("")
  const [pinError, setPinError] = useState<string | null>(null)
  const [isLightMode, setIsLightMode] = useState<boolean>(false)

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
      const resConfig = await http.get<ClientConfig>("/config")
      
      if (resProfs.data) {
        setProfessionals(resProfs.data)
      }
      if (resApps.data) {
        setAppointments(resApps.data)
      }
      if (resConfig.data) {
        setConfig(resConfig.data)
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

  // Efeito para carregar o tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem("kds_theme")
    if (savedTheme === "light") {
      setIsLightMode(true)
    }
  }, [])

  // Efeito para relógio e countdown
  useEffect(() => {
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

    // Se o KDS possuir PIN configurado, exige validação antes de realizar ação
    if (config?.kds_pin) {
      setPinPromptAction({ status })
      setEnteredPin("")
      setPinError(null)
      return
    }

    // Se sem PIN, executa imediatamente
    executeStatusChange(status)
  }

  const handleVerifyPinAndExecute = () => {
    if (enteredPin !== config?.kds_pin) {
      setPinError("PIN incorreto. Tente novamente.")
      return
    }

    if (pinPromptAction) {
      executeStatusChange(pinPromptAction.status)
    }
    setPinPromptAction(null)
    setEnteredPin("")
  }

  const executeStatusChange = async (status: string) => {
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

  const toggleTheme = () => {
    const newTheme = !isLightMode
    setIsLightMode(newTheme)
    localStorage.setItem("kds_theme", newTheme ? "light" : "dark")
  }

  const isLight = isLightMode
  const bgStyle = isLight ? { backgroundColor: "#f8fafc", color: "#1e293b" } : { backgroundColor: "#020617", color: "#f8fafc" }

  const colorPrimary = "#4f46e5"
  const colorSecondary = "#6366f1"
  const colorButton = "#4f46e5"

  // Estilos visuais baseados no status do agendamento
  const getStatusVisuals = (status: string) => {
    switch (status) {
      case "pending":
        return {
          border: isLight ? "border-l-4 border-l-slate-400 bg-white border-slate-200" : "border-l-4 border-l-slate-400 bg-slate-900/60 border-slate-800",
          badge: isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-300 border-slate-700",
          label: "Pendente"
        }
      case "confirmed":
        return {
          border: isLight ? "border-l-4 border-l-blue-500 bg-blue-50/50 border-blue-200" : "border-l-4 border-l-blue-500 bg-blue-950/20 border-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.08)]",
          badge: isLight ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-blue-900/40 text-blue-300 border-blue-800/60",
          label: "Confirmado"
        }
      case "in_progress":
        return {
          border: isLight ? "border-l-4 border-l-amber-500 bg-amber-50 border-amber-250" : "border-l-4 border-l-amber-500 bg-amber-950/30 border-amber-900/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          badge: "bg-amber-500 text-slate-950 font-extrabold",
          label: "Em Atendimento"
        }
      case "completed":
        return {
          border: isLight ? "border-l-4 border-l-emerald-500 bg-emerald-50/30 border-emerald-100 opacity-60" : "border-l-4 border-l-emerald-500 bg-emerald-950/10 border-emerald-950/30 opacity-50",
          badge: isLight ? "bg-emerald-100 text-emerald-700 border-emerald-250" : "bg-emerald-900/30 text-emerald-400 border-emerald-800/40",
          label: "Concluído"
        }
      case "cancelled":
        return {
          border: isLight ? "border-l-4 border-l-red-500 bg-red-50/30 border-red-100 opacity-50 line-through" : "border-l-4 border-l-red-500 bg-red-950/10 border-red-950/30 opacity-40 line-through",
          badge: isLight ? "bg-red-100 text-red-700 border-red-200" : "bg-red-900/30 text-red-400 border-red-800/40",
          label: "Cancelado"
        }
      case "no_show":
        return {
          border: isLight ? "border-l-4 border-l-rose-700 bg-rose-50/30 border-rose-100 opacity-50" : "border-l-4 border-l-rose-700 bg-rose-950/10 border-rose-950/30 opacity-40",
          badge: isLight ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-rose-900/30 text-rose-400 border-rose-800/40",
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
        className={`p-3 md:p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex flex-col gap-2 ${visuals.border}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className={`text-[10px] md:text-xs font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>{app.start_time} - {app.end_time}</span>
            <h4 className={`text-sm md:text-base font-extrabold tracking-wide truncate max-w-[140px] md:max-w-[220px] ${isLight ? "text-slate-800" : "text-white"}`}>
              {app.customer_name || "Cliente sem Nome"}
            </h4>
          </div>
          <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border ${visuals.badge}`}>
            {visuals.label}
          </span>
        </div>

        <div className={`flex flex-col gap-1.5 border-t pt-2 ${isLight ? "border-slate-100" : "border-slate-800/60"}`}>
          <div className={`flex items-center gap-1.5 text-[11px] md:text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            <i className="ti ti-cut text-xs md:text-sm" style={{ color: colorSecondary }} />
            <span className="font-semibold line-clamp-1">{servicesText}</span>
          </div>
          
          <div className="flex items-center justify-between text-[10px] md:text-[11px] mt-0.5 font-medium">
            {app.status === "in_progress" ? (
              <span className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-500/10 px-1.5 md:px-2 py-0.5 rounded-md border border-amber-500/20">
                <i className="ti ti-clock text-[10px] md:text-xs" />
                {getElapsedTime(app.started_at)} min
              </span>
            ) : (
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                <i className="ti ti-clock mr-1 text-slate-400 text-[10px] md:text-xs" />
                {totalDuration} min
              </span>
            )}
            <span className={`flex items-center gap-1 font-semibold ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              <i className="ti ti-user text-slate-400 text-[10px] md:text-xs" />
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
    <div 
      className="flex flex-col h-full w-full overflow-hidden p-3 md:p-6 transition-all duration-300" 
      style={bgStyle}
    >
      
      {/* 1. CABEÇALHO DO KDS COM MARCA */}
      <header className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4 border-b pb-3 md:pb-5 ${isLight ? "border-slate-200" : "border-slate-900"}`}>
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            {config?.logo_central || config?.logo_url ? (
              <img 
                src={config?.logo_central || config?.logo_url} 
                alt="Logo" 
                className="h-8 md:h-10 max-w-[100px] md:max-w-[140px] object-contain rounded-lg shadow-sm" 
              />
            ) : (
              <div 
                className="h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-lg text-white text-sm md:text-xl"
                style={{ backgroundColor: colorPrimary }}
              >
                <i className="ti ti-device-tv" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <h1 className={`text-base md:text-xl font-black tracking-wider uppercase ${isLight ? "text-slate-800" : "text-white"}`}>Painel KDS</h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className={`text-[9px] md:text-xs font-bold uppercase tracking-wider mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Monitoramento de Atendimentos
              </p>
            </div>
          </div>

          {/* Relógio Digital Mobile (HH:MM) */}
          <div className={`flex lg:hidden items-center justify-center border rounded-xl px-3 py-1.5 shadow-inner ${isLight ? "bg-white border-slate-200" : "bg-slate-900/65 border-slate-800/80"}`}>
            <span className={`text-base font-black font-mono tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
              {currentTime ? currentTime.substring(0, 5) : "00:00"}
            </span>
          </div>
        </div>

        {/* Relógio Digital Desktop (Centralizado/Destacado) */}
        <div className={`hidden lg:flex items-center justify-center border rounded-2xl px-6 py-2 shadow-inner ${isLight ? "bg-white border-slate-200" : "bg-slate-900/65 border-slate-800/80"}`}>
          <span className={`text-2xl font-black font-mono tracking-widest ${isLight ? "text-slate-800" : "text-slate-200"}`}>
            {currentTime || "00:00:00"}
          </span>
        </div>

        {/* Controles de Configuração e Refresh */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
          <div className={`flex border rounded-lg p-0.5 ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/40"}`}>
            <button
              onClick={() => setViewMode("columns")}
              style={viewMode === "columns" ? { backgroundColor: colorButton, color: "#fff" } : undefined}
              className={`px-2.5 md:px-3 py-1.5 text-[10px] md:text-xs font-extrabold rounded-md transition ${
                viewMode === "columns" ? "shadow-md" : isLight ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <i className="ti ti-columns mr-1 md:mr-1.5 text-xs md:text-sm" />
              <span className="hidden sm:inline">Por Barbeiro</span>
              <span className="inline sm:hidden">Barbeiro</span>
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              style={viewMode === "timeline" ? { backgroundColor: colorButton, color: "#fff" } : undefined}
              className={`px-2.5 md:px-3 py-1.5 text-[10px] md:text-xs font-extrabold rounded-md transition ${
                viewMode === "timeline" ? "shadow-md" : isLight ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <i className="ti ti-timeline mr-1 md:mr-1.5 text-xs md:text-sm" />
              <span className="hidden sm:inline">Fila Cronológica</span>
              <span className="inline sm:hidden">Fila</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className={`h-8 md:h-9 text-[11px] md:text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isLight ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <i className="ti ti-refresh text-xs md:text-sm" />
              <span className="hidden sm:inline">Recarregar</span> ({countdown}s)
            </Button>

            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className={`h-8 md:h-9 text-[11px] md:text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isLight ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <i className={`ti ${isLight ? "ti-moon" : "ti-sun"} text-xs md:text-sm`} />
              <span className="hidden sm:inline">{isLight ? "Escuro" : "Claro"}</span>
            </Button>

            <Link href="/cliente/agenda">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 md:h-9 text-[11px] md:text-xs font-bold flex items-center gap-1 ${
                  isLight ? "text-slate-500 hover:text-slate-800 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <i className="ti ti-arrow-left text-xs md:text-sm" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. BARRA DE CARDS E KPIs */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 py-2 md:py-4 border-b ${isLight ? "border-slate-200/60" : "border-slate-900/50"}`}>
        <div className={`border rounded-xl p-2.5 md:p-3 flex flex-col ${isLight ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-900"}`}>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Hoje</span>
          <span className={`text-base md:text-xl font-extrabold mt-0.5 md:mt-1 ${isLight ? "text-slate-800" : "text-white"}`}>{totalToday}</span>
        </div>
        <div className={`border rounded-xl p-2.5 md:p-3 flex flex-col border-l-4 border-l-blue-500 ${isLight ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-900"}`}>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-500">Próximos</span>
          <span className={`text-base md:text-xl font-extrabold mt-0.5 md:mt-1 ${isLight ? "text-slate-800" : "text-white"}`}>{pendingCount}</span>
        </div>
        <div className={`border rounded-xl p-2.5 md:p-3 flex flex-col border-l-4 border-l-amber-500 ${isLight ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-900"}`}>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-500">Atendendo</span>
          <span className={`text-base md:text-xl font-extrabold mt-0.5 md:mt-1 ${isLight ? "text-slate-800" : "text-white"}`}>{activeCount}</span>
        </div>
        <div className={`border rounded-xl p-2.5 md:p-3 flex flex-col border-l-4 border-l-emerald-500 ${isLight ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-900"}`}>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-500">Finalizados</span>
          <span className={`text-base md:text-xl font-extrabold mt-0.5 md:mt-1 ${isLight ? "text-slate-800" : "text-white"}`}>{completedCount}</span>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-hidden py-3 md:py-5">
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
          <div className="flex gap-3 md:gap-5 h-full overflow-x-auto pb-4 scrollbar-thin select-none">
            {/* Coluna para agendamentos sem profissional */}
            {getUnassignedAppointments().length > 0 && (
              <div className={`flex-shrink-0 w-72 md:w-80 flex flex-col border rounded-2xl p-3 md:p-4 overflow-hidden h-full ${isLight ? "bg-white border-slate-200" : "bg-slate-900/25 border-slate-900"}`}>
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isLight ? "border-slate-100" : "border-slate-900"}`}>
                  <h3 className={`text-xs md:text-sm font-black uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>Sem Profissional</h3>
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">
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
                <div key={prof.id} className={`flex-shrink-0 w-72 md:w-80 flex flex-col border rounded-2xl p-3 md:p-4 overflow-hidden h-full ${isLight ? "bg-white border-slate-200" : "bg-slate-900/20 border-slate-900/60"}`}>
                  <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isLight ? "border-slate-150" : "border-slate-900/80"}`}>
                    <div className="flex flex-col gap-0.5">
                      <h3 className={`text-xs md:text-sm font-black uppercase tracking-wider truncate max-w-[150px] md:max-w-[200px] ${isLight ? "text-slate-800" : "text-white"}`}>
                        {prof.name}
                      </h3>
                      {profAppsActive > 0 && (
                        <span className="text-[8px] md:text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="h-1 w-1 bg-amber-500 rounded-full"></span>
                          Em Atendimento
                        </span>
                      )}
                    </div>
                    <span className={`border px-2 py-0.5 rounded-full text-xs font-extrabold ${isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-900 border-slate-800 text-slate-300"}`}>
                      {profApps.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 md:gap-3 scrollbar-none pr-1">
                    {profApps.length === 0 ? (
                      <div className={`flex-1 flex flex-col items-center justify-center text-slate-400 text-center gap-1 p-4 border border-dashed rounded-xl ${isLight ? "border-slate-200" : "border-slate-900"}`}>
                        <i className="ti ti-user-x text-xl md:text-2xl" />
                        <span className="text-[10px] md:text-xs font-bold uppercase">Sem agenda</span>
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
          <div className={`h-full overflow-y-auto max-w-3xl mx-auto border p-4 md:p-6 rounded-2xl shadow-inner scrollbar-thin ${isLight ? "bg-white border-slate-200" : "bg-slate-900/10 border-slate-900"}`}>
            <div className="flex flex-col gap-3 md:gap-4">
              {getTimelineAppointments().map((app) => (
                <div key={app.id} className="flex gap-2 md:gap-4 items-stretch">
                  {/* Hora na lateral esquerda */}
                  <div className={`flex flex-col items-center justify-center border px-2 md:px-4 py-1.5 md:py-2 rounded-xl min-w-[70px] md:min-w-[90px] ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-850"}`}>
                    <span className={`text-xs md:text-sm font-black ${isLight ? "text-slate-800" : "text-white"}`}>{app.start_time}</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mt-0.5">Início</span>
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md w-[92vw] sm:w-full rounded-2xl shadow-2xl p-4 md:p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base md:text-lg font-black text-white tracking-wide flex items-center gap-2">
              <i className="ti ti-info-circle text-indigo-500 text-lg md:text-xl" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="py-4 space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Cliente</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.customer_name || "N/A"}</p>
                  {selectedApp.customer_phone && (
                    <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">{selectedApp.customer_phone}</p>
                  )}
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Profissional (Barbeiro)</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.professional_name}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Serviços Contratados</span>
                <div className="bg-slate-950/20 rounded-xl border border-slate-850 p-3 flex flex-col gap-2">
                  {selectedApp.services?.map((svc, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] md:text-xs font-semibold">
                      <span className="text-slate-300">{svc.service_name}</span>
                      <span className="text-slate-400">R$ {svc.price.toFixed(2)} ({svc.duration_minutes} min)</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800/80 pt-2 mt-1 flex justify-between items-center text-[11px] md:text-xs font-bold text-white">
                    <span>Total</span>
                    <span>
                      R$ {selectedApp.services?.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Horário Previsto</span>
                  <p className="font-extrabold text-white mt-0.5">{selectedApp.start_time} até {selectedApp.end_time}</p>
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Atual</span>
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
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Controle de Atendimento KDS
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleQuickStatusChange("in_progress")}
                    disabled={updatingStatus || selectedApp.status === "in_progress"}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-10 md:h-11 flex items-center justify-center gap-1.5 border-none cursor-pointer text-xs md:text-sm"
                  >
                    <i className="ti ti-play text-xs md:text-base" />
                    Iniciar
                  </Button>

                  <Button
                    onClick={() => handleQuickStatusChange("completed")}
                    disabled={updatingStatus || selectedApp.status === "completed"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-10 md:h-11 flex items-center justify-center gap-1.5 border-none cursor-pointer text-xs md:text-sm"
                  >
                    <i className="ti ti-checkbox text-xs md:text-base" />
                    Concluir
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleQuickStatusChange("confirmed")}
                    disabled={updatingStatus || selectedApp.status === "confirmed"}
                    variant="outline"
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-[10px] md:text-xs font-bold h-9 cursor-pointer"
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => handleQuickStatusChange("no_show")}
                    disabled={updatingStatus || selectedApp.status === "no_show"}
                    variant="outline"
                    className="border-rose-950/60 bg-rose-950/10 hover:bg-rose-950/20 text-rose-300 text-[10px] md:text-xs font-bold h-9 cursor-pointer"
                  >
                    Falta
                  </Button>
                  <Button
                    onClick={() => handleQuickStatusChange("cancelled")}
                    disabled={updatingStatus || selectedApp.status === "cancelled"}
                    variant="outline"
                    className="border-red-950/60 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-[10px] md:text-xs font-bold h-9 cursor-pointer"
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
              className="w-full border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white font-bold h-10 cursor-pointer text-xs md:text-sm"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE PIN DE SEGURANÇA */}
      <Dialog open={!!pinPromptAction} onOpenChange={(open) => !open && setPinPromptAction(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm w-[92vw] sm:w-full rounded-2xl p-5 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm md:text-base font-black text-white text-center">
              Confirmação de Segurança
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center gap-4">
            <p className="text-[11px] md:text-xs text-slate-400 text-center font-medium">
              Digite o PIN do KDS para autorizar esta alteração de status.
            </p>
            <input
              type="password"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              value={enteredPin}
              onChange={(e) => {
                setPinError(null)
                setEnteredPin(e.target.value.replace(/\D/g, ""))
              }}
              placeholder="••••"
              className="w-36 md:w-40 text-center h-10 md:h-12 rounded-xl bg-slate-950 border border-slate-800 text-white font-black tracking-[0.5em] text-xl md:text-2xl focus:border-indigo-500 outline-none"
            />
            {pinError && (
              <span className="text-xs text-red-500 font-bold">{pinError}</span>
            )}
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setPinPromptAction(null)
                setEnteredPin("")
                setPinError(null)
              }}
              className="border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white font-bold h-10 text-xs md:text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerifyPinAndExecute}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs md:text-sm"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
}
