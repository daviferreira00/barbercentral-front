"use client"

import { useApp } from "@/shared/context/AppContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ClientePage() {
  const { user } = useApp()

  if (!user) return null

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bem-vindo, {user.name}. Confira a movimentação da sua barbearia hoje.
        </p>
      </div>

      {/* Grid de Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agendamentos Hoje
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              <span className="text-emerald-500 font-bold mr-1">3 finalizados</span> de um total de 8
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Caixa Diário
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">R$ 280,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              Em dinheiro, pix e cartões de débito/crédito
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Taxa de Ocupação
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">75%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              Média de ocupação das agendas dos profissionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Próximos Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Atendimentos</CardTitle>
          <CardDescription>Visualização rápida dos agendamentos programados para hoje.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Arthur Pendragon</td>
                  <td className="p-4">14:00 - 14:45</td>
                  <td className="p-4">Marcos Cabeleireiro</td>
                  <td className="p-4">Corte Degradê + Barboterapia</td>
                  <td className="p-4 pr-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">
                      Confirmado
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Guilherme Silva</td>
                  <td className="p-4">15:00 - 15:30</td>
                  <td className="p-4">Tiago Barbeiro</td>
                  <td className="p-4">Corte Clássico Tesoura</td>
                  <td className="p-4 pr-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      Concluído
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Ricardo Santos</td>
                  <td className="p-4">16:30 - 17:00</td>
                  <td className="p-4">Marcos Cabeleireiro</td>
                  <td className="p-4">Design de Barba</td>
                  <td className="p-4 pr-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                      Pendente
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
