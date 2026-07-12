export interface Professional {
  id: string
  name: string
}

export interface EnrichedAppointment {
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
  cancel_token?: string
}

export interface BlockedSlot {
  id: string
  professional_id?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
}

export const VIEW_MODES = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
]

// Helper para formatar data YYYY-MM-DD sem shift de timezone
export const formatDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Helper para limpar data recebida da API que pode vir no formato ISO (com T) ou com hora
export const cleanDate = (dateStr?: string) => {
  if (!dateStr) return ""
  return dateStr.split("T")[0].split(" ")[0]
}

// Helpers de Estilos por Status
export const getStatusStyle = (status: string) => {
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

export const getStatusLabel = (status: string) => {
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
