"use client"

export type AppointmentStatus = "Confirmado" | "Concluído" | "Pendente"

export interface UpcomingAppointment {
  customer: string
  time: string
  professional: string
  services: string
  status: AppointmentStatus
}

export interface DashboardData {
  appointmentsToday: number
  appointmentsDone: number
  cashToday: string
  occupancyRate: string
  upcoming: UpcomingAppointment[]
  loading: boolean
}

// Dados do painel geral. Hoje são mockados (mesmos valores exibidos na tela
// original); quando o endpoint existir, trocar por fetch mantendo esta interface.
export function useDashboard(): DashboardData {
  return {
    appointmentsToday: 8,
    appointmentsDone: 3,
    cashToday: "R$ 280,00",
    occupancyRate: "75%",
    upcoming: [
      {
        customer: "Arthur Pendragon",
        time: "14:00 - 14:45",
        professional: "Marcos Cabeleireiro",
        services: "Corte Degradê + Barboterapia",
        status: "Confirmado",
      },
      {
        customer: "Guilherme Silva",
        time: "15:00 - 15:30",
        professional: "Tiago Barbeiro",
        services: "Corte Clássico Tesoura",
        status: "Concluído",
      },
      {
        customer: "Ricardo Santos",
        time: "16:30 - 17:00",
        professional: "Marcos Cabeleireiro",
        services: "Design de Barba",
        status: "Pendente",
      },
    ],
    loading: false,
  }
}
