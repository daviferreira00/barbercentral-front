"use client"

import { useRelatorios } from "@/features/relatorios/hooks/useRelatorios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { 
  TrendingUp, 
  Users, 
  XSquare, 
  Download, 
  FileText, 
  Percent, 
  Clock, 
  Activity, 
  UserCheck, 
  Loader2,
  ChevronRight,
  Calendar
} from "lucide-react"

export default function RelatoriosDesktop() {
  const {
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
  } = useRelatorios()

  const getMovementTypeLabel = (t: string) => {
    switch (t) {
      case "in": return "Entrada (+)"
      case "out": return "Saída (-)"
      case "adjustment": return "Ajuste"
      default: return t
    }
  }

  if (errorMsg) {
    return (
      <div className="container max-w-4xl py-12 space-y-6">
        <Alert variant="error">
          {errorMsg}
        </Alert>
        <Card className="border-dashed bg-slate-50">
          <CardContent className="p-8 text-center space-y-4">
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Módulo de Relatórios Avançados</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Faça o upgrade do seu plano para gerenciar a produtividade da sua equipe, analisar novos clientes vs recorrentes e controlar o faturamento por serviço de forma inteligente.
            </p>
            <Link href="/cliente/configuracoes/plano" className="inline-block">
              <Button>Ver Planos & Upgrade</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 px-1 md:px-0">
      {/* Topo e Filtros Globais */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Relatórios e Indicadores
          </h1>
          <p className="text-xs text-slate-400 mt-1">Análise operacional e financeira da barbearia em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-2 rounded-xl border w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Calendar className="h-4 w-4" /> Período:
          </div>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="h-8 text-xs font-semibold w-32 border-slate-200 bg-white" 
          />
          <span className="text-xs text-slate-400">até</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="h-8 text-xs font-semibold w-32 border-slate-200 bg-white" 
          />
          
          {activeTab === "financeiro" || activeTab === "ocupacao" ? (
            <Select value={selectedProf} onValueChange={setSelectedProf}>
              <SelectTrigger className="h-8 text-xs font-semibold w-40 border-slate-200 bg-white">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Profissionais</SelectItem>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      {/* Sub-navegação */}
      <div className="flex border-b border-slate-200 gap-1 flex-wrap">
        {[
          { id: "dashboard", label: "Dashboard Geral", icon: Activity },
          { id: "financeiro", label: "Financeiro & Faturamento", icon: TrendingUp },
          { id: "ocupacao", label: "Ocupação de Agenda", icon: Clock },
          { id: "clientes", label: "Clientes & Retenção", icon: Users },
          { id: "cancelamentos", label: "Faltas e Cancelamentos", icon: XSquare }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                isActive
                  ? "border-primary text-slate-800 bg-slate-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Processando métricas e compilando gráficos...</span>
        </div>
      ) : (
        <>
          {/* TAB: DASHBOARD GERAL */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
              <Card className="hover:border-primary/45 transition cursor-pointer" onClick={() => setActiveTab("financeiro")}>
                <CardHeader className="pb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Total</span>
                  <CardTitle className="text-2xl font-black text-slate-800 mt-1">
                    R$ {revenueData?.total_revenue.toFixed(2) || "0,00"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-xs text-slate-400">
                  <span>Visualizar receita detalhada</span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </CardContent>
              </Card>

              <Card className="hover:border-primary/45 transition cursor-pointer" onClick={() => setActiveTab("ocupacao")}>
                <CardHeader className="pb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Ocupação</span>
                  <CardTitle className="text-2xl font-black text-slate-800 mt-1">
                    {occupancyData?.occupancy_rate.toFixed(1) || "0.0"}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-xs text-slate-400">
                  <span>Visualizar uso do tempo</span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </CardContent>
              </Card>

              <Card className="hover:border-primary/45 transition cursor-pointer" onClick={() => setActiveTab("clientes")}>
                <CardHeader className="pb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Retorno</span>
                  <CardTitle className="text-2xl font-black text-slate-800 mt-1">
                    {customerData?.return_rate.toFixed(1) || "0.0"}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-xs text-slate-400">
                  <span>Novos vs recorrentes</span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </CardContent>
              </Card>

              <Card className="hover:border-primary/45 transition cursor-pointer" onClick={() => setActiveTab("cancelamentos")}>
                <CardHeader className="pb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Cancelamentos</span>
                  <CardTitle className="text-2xl font-black text-slate-800 mt-1">
                    {cancelData?.cancellation_rate.toFixed(1) || "0.0"}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-xs text-slate-400">
                  <span>Auditar no-shows e faltas</span>
                  <ChevronRight className="h-4 w-4 text-slate-350" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB: FINANCEIRO */}
          {activeTab === "financeiro" && revenueData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end gap-3">
                <Button size="sm" variant="outline" className="text-xs h-9 font-bold" onClick={() => handleExportCSV("revenue")}>
                  <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
                </Button>
                <Button size="sm" className="text-xs h-9 font-bold" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-1.5" /> Exportar PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Total</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block">R$ {revenueData.total_revenue.toFixed(2)}</span>
                    </div>
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Médio</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block">R$ {revenueData.average_ticket.toFixed(2)}</span>
                    </div>
                    <Percent className="h-6 w-6 text-indigo-500" />
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Pagamentos</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block">{revenueData.total_payments}</span>
                    </div>
                    <UserCheck className="h-6 w-6 text-amber-500" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Receita por Profissional */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Faturamento por Profissional</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 border-t">
                    {(revenueData.professional_revenue || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold">Nenhum faturamento registrado no período.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-slate-50/50 border-b">
                          <tr>
                            <th className="px-6 py-3">Profissional</th>
                            <th className="px-6 py-3 text-center">Atendimentos</th>
                            <th className="px-6 py-3 text-right">Faturado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(revenueData.professional_revenue || []).map((p, i) => (
                            <tr key={i} className="hover:bg-slate-50/20">
                              <td className="px-6 py-3.5 font-bold text-slate-700">{p.label}</td>
                              <td className="px-6 py-3.5 text-center font-semibold text-slate-500">{p.count}</td>
                              <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">R$ {p.value.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>

                {/* Métodos de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Métodos de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(revenueData.method_revenue || []).length === 0 ? (
                      <div className="text-center text-xs text-slate-400 font-semibold py-8">Sem transações no período.</div>
                    ) : (
                      (revenueData.method_revenue || []).map((m, i) => {
                        const total = revenueData.total_revenue || 1
                        const pct = (m.value / total) * 100
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="capitalize">{m.label}</span>
                              <span>R$ {m.value.toFixed(2)} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                              <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Receita por Serviço */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">Serviços Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  {(revenueData.service_revenue || []).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-semibold">Nenhum serviço faturado no período.</div>
                  ) : (
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50/50 border-b">
                        <tr>
                          <th className="px-6 py-3">Serviço</th>
                          <th className="px-6 py-3 text-center">Quantidade</th>
                          <th className="px-6 py-3 text-right">Faturado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(revenueData.service_revenue || []).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50/20">
                            <td className="px-6 py-3.5 font-bold text-slate-700">{s.label}</td>
                            <td className="px-6 py-3.5 text-center font-semibold text-slate-500">{s.count}</td>
                            <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">R$ {s.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB: OCUPAÇÃO */}
          {activeTab === "ocupacao" && occupancyData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="text-xs h-9 font-bold" onClick={() => handleExportCSV("occupancy")}>
                  <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card de Ocupação */}
                <Card className="bg-slate-55 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">Ocupação Geral</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-6 space-y-4">
                    <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-8 border-primary/20 border-t-primary relative">
                      <span className="text-2xl font-black text-slate-800">
                        {occupancyData.occupancy_rate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Percentual de horas agendadas em relação ao total de horas de expediente de toda a equipe no período selecionado.
                    </p>
                  </CardContent>
                </Card>

                {/* Ocupação por Profissional */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Uso da Agenda por Profissional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(occupancyData.professional_hours || []).length === 0 ? (
                      <div className="text-center text-xs text-slate-400 font-semibold py-8">Nenhum profissional agendado no período.</div>
                    ) : (
                      (occupancyData.professional_hours || []).map((ph, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="font-bold text-slate-700">{ph.label}</span>
                            <span className="text-slate-500">
                              {ph.hours_booked.toFixed(1)}h / {ph.hours_allowed.toFixed(0)}h ({ph.percent.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${ph.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap de Horários */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">Intensidade de Agendamentos (Dias da Semana)</CardTitle>
                  <CardDescription>Dias e horários com maior volume de atendimentos concluídos.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead className="bg-slate-50/50 border-b font-bold text-slate-450 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Dia da Semana</th>
                          <th>Manhã (08:00 - 12:00)</th>
                          <th>Tarde (12:00 - 16:00)</th>
                          <th>Final de Tarde (16:00 - 20:00)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-655">
                        {[
                          { val: 1, label: "Domingo" },
                          { val: 2, label: "Segunda-feira" },
                          { val: 3, label: "Terça-feira" },
                          { val: 4, label: "Quarta-feira" },
                          { val: 5, label: "Quinta-feira" },
                          { val: 6, label: "Sexta-feira" },
                          { val: 7, label: "Sábado" }
                        ].map((day) => {
                          const morning = (occupancyData.weekday_heatmap || [])
                            .filter((h) => h.weekday === day.val && h.hour >= 8 && h.hour < 12)
                            .reduce((acc, curr) => acc + curr.count, 0)
                          
                          const afternoon = (occupancyData.weekday_heatmap || [])
                            .filter((h) => h.weekday === day.val && h.hour >= 12 && h.hour < 16)
                            .reduce((acc, curr) => acc + curr.count, 0)

                          const evening = (occupancyData.weekday_heatmap || [])
                            .filter((h) => h.weekday === day.val && h.hour >= 16 && h.hour < 20)
                            .reduce((acc, curr) => acc + curr.count, 0)

                          const getHeatClass = (count: number) => {
                            if (count === 0) return "bg-white"
                            if (count < 3) return "bg-indigo-50 text-indigo-700 font-bold"
                            if (count < 8) return "bg-indigo-100 text-indigo-800 font-extrabold"
                            return "bg-indigo-200 text-indigo-950 font-black"
                          }

                          return (
                            <tr key={day.val}>
                              <td className="px-4 py-3 text-left font-bold text-slate-700 bg-slate-50/20">{day.label}</td>
                              <td className={`px-4 py-3 border-l ${getHeatClass(morning)}`}>{morning} agendamentos</td>
                              <td className={`px-4 py-3 border-l ${getHeatClass(afternoon)}`}>{afternoon} agendamentos</td>
                              <td className={`px-4 py-3 border-l ${getHeatClass(evening)}`}>{evening} agendamentos</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB: CLIENTES */}
          {activeTab === "clientes" && customerData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="text-xs h-9 font-bold" onClick={() => handleExportCSV("customers")}>
                  <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Totais</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{customerData.total_customers}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Novos no Período</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{customerData.new_customers}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Recorrentes</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{customerData.returning_customers}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Retorno</span>
                    <span className="text-2xl font-black text-slate-850 mt-1 block">{customerData.return_rate.toFixed(1)}%</span>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Clientes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Top 10 Clientes por Valor Gasto</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 border-t">
                    {(customerData.top_customers || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold">Sem visitas registradas no período.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-slate-50/50 border-b">
                          <tr>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3 text-center">Visitas</th>
                            <th className="px-6 py-3 text-right">Valor Gasto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(customerData.top_customers || []).map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50/20">
                              <td className="px-6 py-3.5 font-bold text-slate-700">{c.label}</td>
                              <td className="px-6 py-3.5 text-center font-semibold text-slate-500">{c.count}</td>
                              <td className="px-6 py-3.5 text-right font-extrabold text-slate-850">R$ {c.value.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>

                {/* Churn Clientes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Clientes Sumidos (+60 dias de ausência)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 border-t">
                    {(customerData.churn_customers || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold">Nenhum cliente ausente detectado.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-slate-50/50 border-b">
                          <tr>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3 text-center">Último Atendimento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(customerData.churn_customers || []).map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50/20">
                              <td className="px-6 py-3.5 font-bold text-slate-700">{c.label}</td>
                              <td className="px-6 py-3.5 text-center font-semibold text-red-500">
                                {c.date ? new Date(c.date + "T00:00:00").toLocaleDateString("pt-BR") : "Nenhum"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: CANCELAMENTOS */}
          {activeTab === "cancelamentos" && cancelData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="text-xs h-9 font-bold" onClick={() => handleExportCSV("cancellations")}>
                  <Download className="h-4 w-4 mr-1.5" /> Exportar CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Agendamentos Totais</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{cancelData.total_appointments}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cancelados</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{cancelData.cancellations}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Faltas (No-shows)</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{cancelData.no_shows}</span>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                  <CardContent className="p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa Absenteísmo</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{cancelData.cancellation_rate.toFixed(1)}%</span>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cancelamentos por Profissional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Absenteísmo por Profissional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(cancelData.professional_cancellations || []).length === 0 ? (
                      <div className="text-center text-xs text-slate-400 font-semibold py-8">Nenhum cancelamento no período.</div>
                    ) : (
                      (cancelData.professional_cancellations || []).map((p, i) => {
                        const maxCancels = Math.max(...(cancelData.professional_cancellations || []).map((x) => x.count)) || 1
                        const pct = (p.count / maxCancels) * 100
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="font-bold text-slate-700">{p.label}</span>
                              <span className="text-slate-500">{p.count} cancelados</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                              <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Lista de motivos de cancelamentos */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Últimos Cancelamentos com Justificativa</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 border-t">
                    {(cancelData.recent_cancellations || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold">Nenhuma justificativa no período.</div>
                    ) : (
                      <table className="w-full text-xs text-left text-slate-600">
                        <thead className="bg-slate-50/50 border-b">
                          <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Profissional</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Motivo / Notas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(cancelData.recent_cancellations || []).map((rc, i) => (
                            <tr key={i} className="hover:bg-slate-50/20">
                              <td className="px-6 py-3.5 text-slate-500">
                                {rc.date ? new Date(rc.date + "T00:00:00").toLocaleDateString("pt-BR") : ""} - {rc.time ? rc.time.substring(0, 5) : ""}
                              </td>
                              <td className="px-6 py-3.5 font-bold text-slate-700">{rc.professional}</td>
                              <td className="px-6 py-3.5 font-semibold text-slate-600">{rc.customer || "Sem cadastro"}</td>
                              <td className="px-6 py-3.5 text-slate-550 italic font-medium">{rc.reason || "Não informado"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
