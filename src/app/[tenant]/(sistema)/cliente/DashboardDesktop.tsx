"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useApp } from "@/shared/context/AppContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDashboard, type AppointmentStatus } from "@/features/dashboard/hooks/useDashboard"
import { Loader2 } from "lucide-react"

const STATUS_BADGES: Record<AppointmentStatus, string> = {
  Confirmado: "bg-amber-50 text-amber-700 border-amber-100",
  Concluído: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Pendente: "bg-blue-50 text-blue-700 border-blue-100",
}

export default function DashboardDesktop() {
  const { user } = useApp()
  const params = useParams()
  const tenant = (params?.tenant as string) || "barbearia-modelo"
  const { appointmentsToday, appointmentsDone, cashToday, occupancyRate, upcoming, loading } = useDashboard()

  if (!user) return null

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-450">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-sm font-semibold">Carregando painel geral...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bem-vindo, {user.name}. Confira a movimentação da sua barbearia hoje.
          </p>
        </div>

        {/* Atalhos Rápidos Desktop */}
        <div className="flex gap-2 items-center flex-wrap">
          <Link href="/cliente/agenda/novo">
            <Button variant="outline" className="flex items-center gap-2 text-xs font-bold text-slate-700 border-slate-200">
              <i className="ti ti-calendar-plus text-primary text-sm" />
              Novo Agendamento
            </Button>
          </Link>
          <Link href="/cliente/agenda/kds">
            <Button variant="outline" className="flex items-center gap-2 text-xs font-bold text-slate-700 border-slate-200">
              <i className="ti ti-device-desktop-analytics text-primary text-sm" />
              Painel KDS
            </Button>
          </Link>
          <a href={`/agendamento/${tenant}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2 text-xs font-bold text-slate-700 border-slate-200">
              <i className="ti ti-world text-primary text-sm" />
              Link de Agendamento
            </Button>
          </a>
        </div>
      </div>

      {/* Grid de Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-450">
              Agendamentos Hoje
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{appointmentsToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              <span className="text-emerald-500 font-bold mr-1">{appointmentsDone} finalizados</span> de um total de {appointmentsToday}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-450">
              Caixa Diário
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{cashToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              Em dinheiro, pix e cartões de débito/crédito
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-450">
              Taxa de Ocupação
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">{occupancyRate}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              Média de ocupação das agendas dos profissionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Próximos Atendimentos */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Próximos Atendimentos</CardTitle>
          <CardDescription>Visualização rápida dos agendamentos programados para hoje.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {upcoming.length === 0 ? (
              <div className="p-12 text-center text-sm font-semibold text-slate-450 italic">
                Nenhum agendamento programado para hoje.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 pl-6">Cliente</th>
                    <th className="p-4">Horário</th>
                    <th className="p-4">Profissional</th>
                    <th className="p-4">Serviços</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {upcoming.map((a) => (
                    <tr key={`${a.customer}-${a.time}`}>
                      <td className="p-4 pl-6 font-bold text-slate-800">{a.customer}</td>
                      <td className="p-4">{a.time}</td>
                      <td className="p-4">{a.professional}</td>
                      <td className="p-4">{a.services}</td>
                      <td className="p-4 pr-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_BADGES[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
