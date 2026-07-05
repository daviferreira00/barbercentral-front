"use client"

import { useRelatorios } from "@/features/relatorios/hooks/useRelatorios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { FilterChips } from "@/components/mobile/FilterChips"
import { ListCard } from "@/components/mobile/ListCard"
import { haptic } from "@/shared/lib/haptics"
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

export default function RelatoriosMobile() {
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

  const tabs = [
    { value: "dashboard", label: "Geral" },
    { value: "financeiro", label: "Faturamento" },
    { value: "ocupacao", label: "Agenda" },
    { value: "clientes", label: "Clientes" },
    { value: "cancelamentos", label: "Faltas" }
  ]

  if (errorMsg) {
    return (
      <div className="flex flex-col gap-6 py-6 px-1 animate-fade-in">
        <Alert variant="error">
          {errorMsg}
        </Alert>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-4 shadow-sm">
          <TrendingUp className="h-10 w-10 text-slate-400 mx-auto animate-bounce" />
          <h3 className="text-base font-extrabold text-slate-800">Relatórios Avançados</h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs mx-auto">
            Faça o upgrade do seu plano para gerenciar a produtividade da sua equipe, analisar novos clientes vs recorrentes e controlar o faturamento de forma inteligente.
          </p>
          <Link href="/cliente/configuracoes/plano" className="inline-block w-full">
            <button
              onClick={() => haptic()}
              className="mobile-tap w-full rounded-xl py-3 text-xs font-extrabold text-white shadow-md"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Ver Planos & Upgrade
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-1.5">
          <Activity className="h-5 w-5 text-primary" /> Relatórios
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Indicadores operacionais e financeiros.</p>
      </div>

      {/* Filtros de data e profissional */}
      <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          <Calendar className="h-3.5 w-3.5" /> Período
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="h-10 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200" 
          />
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="h-10 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200" 
          />
        </div>

        {(activeTab === "financeiro" || activeTab === "ocupacao") && (
          <div className="mt-1">
            <Select value={selectedProf} onValueChange={setSelectedProf}>
              <SelectTrigger className="h-10 text-sm font-semibold rounded-xl bg-slate-50 border-slate-200 w-full">
                <SelectValue placeholder="Selecionar Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Profissionais</SelectItem>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Chips de Categorias/Tabs */}
      <FilterChips
        options={tabs}
        value={activeTab}
        onChange={(val) => {
          haptic()
          setActiveTab(val as any)
        }}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[220px] text-slate-400 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs font-semibold">Compilando dados...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* TAB 1: DASHBOARD GERAL */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-3 animate-card-enter">
              <div 
                onClick={() => { haptic(); setActiveTab("financeiro") }}
                className="mobile-tap rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Total</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    R$ {revenueData?.total_revenue.toFixed(2) || "0,00"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <span>Detalhes</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div 
                onClick={() => { haptic(); setActiveTab("ocupacao") }}
                className="mobile-tap rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Ocupação</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    {occupancyData?.occupancy_rate.toFixed(1) || "0.0"}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <span>Detalhes</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div 
                onClick={() => { haptic(); setActiveTab("clientes") }}
                className="mobile-tap rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Retorno</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    {customerData?.return_rate.toFixed(1) || "0.0"}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <span>Detalhes</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div 
                onClick={() => { haptic(); setActiveTab("cancelamentos") }}
                className="mobile-tap rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absenteísmo / Faltas</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">
                    {cancelData?.cancellation_rate.toFixed(1) || "0.0"}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                  <span>Detalhes</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCEIRO */}
          {activeTab === "financeiro" && revenueData && (
            <div className="flex flex-col gap-4 animate-card-enter">
              {/* Botões de Exportação */}
              <div className="flex gap-2">
                <button 
                  onClick={() => { haptic(); handleExportCSV("revenue") }}
                  className="mobile-tap flex-1 h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
                >
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button 
                  onClick={() => { haptic(); handleExportPDF() }}
                  className="mobile-tap flex-1 h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
                >
                  <FileText className="h-4 w-4" /> PDF
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Faturamento</span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">R$ {revenueData.total_revenue.toFixed(0)}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Ticket Médio</span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">R$ {revenueData.average_ticket.toFixed(0)}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Vendas</span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">{revenueData.total_payments}</span>
                </div>
              </div>

              {/* Faturamento por Profissional */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Por Profissional</h3>
                {revenueData.professional_revenue.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem registros.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {revenueData.professional_revenue.map((p, i) => (
                      <ListCard
                        key={i}
                        index={i}
                        title={p.label}
                        subtitle={`Atendimentos: ${p.count}`}
                        pill={{ label: `R$ ${p.value.toFixed(2)}`, tone: "success" }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Métodos de Pagamento */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Métodos de Pagamento</h3>
                {revenueData.method_revenue.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem transações.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {revenueData.method_revenue.map((m, i) => {
                      const total = revenueData.total_revenue || 1
                      const pct = (m.value / total) * 100
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="capitalize text-slate-700">{m.label}</span>
                            <span className="text-slate-500">R$ {m.value.toFixed(0)} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Serviços mais vendidos */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Serviços Mais Vendidos</h3>
                {revenueData.service_revenue.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem registros.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {revenueData.service_revenue.map((s, i) => (
                      <ListCard
                        key={i}
                        index={i}
                        title={s.label}
                        subtitle={`Quantidade: ${s.count}`}
                        pill={{ label: `R$ ${s.value.toFixed(0)}`, tone: "success" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OCUPAÇÃO */}
          {activeTab === "ocupacao" && occupancyData && (
            <div className="flex flex-col gap-4 animate-card-enter">
              <button 
                onClick={() => { haptic(); handleExportCSV("occupancy") }}
                className="mobile-tap w-full h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
              >
                <Download className="h-4 w-4" /> Exportar CSV
              </button>

              {/* Grafico Circular Simplificado */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center flex flex-col items-center gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Ocupação Geral da Agenda</h3>
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border-8 border-primary/20 border-t-primary relative my-1">
                  <span className="text-lg font-black text-slate-800">
                    {occupancyData.occupancy_rate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 leading-normal max-w-xs">
                  Percentual de horários preenchidos frente ao expediente de toda a equipe.
                </p>
              </div>

              {/* Ocupação por Profissional */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Por Profissional</h3>
                {occupancyData.professional_hours.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem registros.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {occupancyData.professional_hours.map((ph, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">{ph.label}</span>
                          <span className="text-slate-500">({ph.percent.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${ph.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Intensidade (Heatmap Simplificado) */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Intensidade por Dia da Semana</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { val: 1, label: "Domingo" },
                    { val: 2, label: "Segunda-feira" },
                    { val: 3, label: "Terça-feira" },
                    { val: 4, label: "Quarta-feira" },
                    { val: 5, label: "Quinta-feira" },
                    { val: 6, label: "Sexta-feira" },
                    { val: 7, label: "Sábado" }
                  ].map((day) => {
                    const totalCount = occupancyData.weekday_heatmap
                      .filter((h) => h.weekday === day.val)
                      .reduce((acc, curr) => acc + curr.count, 0)

                    let heatColor = "text-slate-400 border-slate-100"
                    let heatLabel = "Ocioso"

                    if (totalCount > 0) {
                      if (totalCount < 5) {
                        heatColor = "text-indigo-500 bg-indigo-50 border-indigo-100"
                        heatLabel = "Moderado"
                      } else if (totalCount < 12) {
                        heatColor = "text-indigo-700 bg-indigo-100 border-indigo-200"
                        heatLabel = "Movimentado"
                      } else {
                        heatColor = "text-indigo-950 bg-indigo-200 border-indigo-300"
                        heatLabel = "Lotado"
                      }
                    }

                    return (
                      <div key={day.val} className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{day.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-500">{totalCount} atendimentos</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${heatColor}`}>
                            {heatLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENTES */}
          {activeTab === "clientes" && customerData && (
            <div className="flex flex-col gap-4 animate-card-enter">
              <button 
                onClick={() => { haptic(); handleExportCSV("customers") }}
                className="mobile-tap w-full h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
              >
                <Download className="h-4 w-4" /> Exportar CSV
              </button>

              {/* KPI Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Total</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{customerData.total_customers}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Novos</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{customerData.new_customers}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Recorr.</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{customerData.returning_customers}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Retorno</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{customerData.return_rate.toFixed(0)}%</span>
                </div>
              </div>

              {/* Top Clientes */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Melhores Clientes (Valor Gasto)</h3>
                {customerData.top_customers.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem registros.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {customerData.top_customers.map((c, i) => (
                      <ListCard
                        key={i}
                        index={i}
                        title={c.label}
                        subtitle={`Visitas: ${c.count}`}
                        pill={{ label: `R$ ${c.value.toFixed(2)}`, tone: "success" }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Clientes Inativos */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sumidos (+60 dias de ausência)</h3>
                {customerData.churn_customers.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Nenhum ausente.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {customerData.churn_customers.map((c, i) => (
                      <ListCard
                        key={i}
                        index={i}
                        title={c.label}
                        subtitle={
                          c.date 
                            ? `Último atendimento em: ${new Date(c.date + "T00:00:00").toLocaleDateString("pt-BR")}` 
                            : "Nenhum atendimento"
                        }
                        pill={{ label: "Ausente", tone: "danger" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CANCELAMENTOS */}
          {activeTab === "cancelamentos" && cancelData && (
            <div className="flex flex-col gap-4 animate-card-enter">
              <button 
                onClick={() => { haptic(); handleExportCSV("cancellations") }}
                className="mobile-tap w-full h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
              >
                <Download className="h-4 w-4" /> Exportar CSV
              </button>

              {/* KPI Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Total</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{cancelData.total_appointments}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Cancelado</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{cancelData.cancellations}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Faltas</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">{cancelData.no_shows}</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-2 shadow-sm text-center">
                  <span className="text-[9px] font-bold text-slate-400 block truncate">Faltas %</span>
                  <span className="text-xs font-black text-slate-850 mt-1 block">{cancelData.cancellation_rate.toFixed(0)}%</span>
                </div>
              </div>

              {/* Absenteísmo por Profissional */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Faltas por Profissional</h3>
                {cancelData.professional_cancellations.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem registros.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {cancelData.professional_cancellations.map((p, i) => {
                      const maxCancels = Math.max(...cancelData.professional_cancellations.map((x) => x.count)) || 1
                      const pct = (p.count / maxCancels) * 100
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">{p.label}</span>
                            <span className="text-slate-500">{p.count} cancelamentos</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Últimos Cancelamentos com Justificativa */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Últimos Cancelamentos</h3>
                {cancelData.recent_cancellations.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Sem justificativas registradas.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {cancelData.recent_cancellations.map((rc, i) => (
                      <ListCard
                        key={i}
                        index={i}
                        title={rc.customer || "Sem cadastro"}
                        subtitle={
                          <span className="flex flex-col gap-1 text-slate-500 font-semibold text-xs leading-normal">
                            <span>Profissional: {rc.professional}</span>
                            <span className="italic text-slate-400 mt-0.5">Motivo: {rc.reason || "Não informado"}</span>
                          </span>
                        }
                        pill={{
                          label: `${new Date(rc.date + "T00:00:00").toLocaleDateString("pt-BR")} às ${rc.time.substring(0, 5)}`,
                          tone: "neutral"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
