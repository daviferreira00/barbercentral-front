"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Award, Star, Gift, History, Loader2, RefreshCw, CheckCircle2 } from "lucide-react"

interface CustomerStats {
  id: string
  name: string
  phone: string
  email?: string
  cpf?: string
  birth_date?: string
  notes?: string
  total_visits: number
  total_spent: number
  last_visit?: string
  first_visit?: string
}

interface EnrichedAppointmentHistory {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  professional_name: string
  services_list: string
  total_price: number
  payment_status?: string
  payment_method?: string
}

interface LoyaltyProgram {
  id: string
  name: string
  type: string // stamps, points
  stamps_to_reward?: number
  points_per_real?: number
  reward_description: string
  active: number
}

interface LoyaltyCard {
  id: string
  customer_id: string
  client_id: string
  program_id: string
  stamps_count: number
  points_balance: number
  status: string
  created_at: string
}

interface LoyaltyTransaction {
  id: string
  card_id: string
  type: string // earn, redeem
  stamps_value?: number
  points_value?: number
  description: string
  created_by: string
  created_at: string
}

export default function DetalheClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const customerId = params.id

  const [customer, setCustomer] = useState<CustomerStats | null>(null)
  const [history, setHistory] = useState<EnrichedAppointmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Local Tab State
  const [activeTab, setActiveTab] = useState<"cadastro" | "historico" | "fidelidade">("cadastro")

  // Edit fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [notes, setNotes] = useState("")

  // Loyalty states
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null)
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([])
  const [loadingLoyalty, setLoadingLoyalty] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [redeemNotes, setRedeemNotes] = useState("")
  const [redeeming, setRedeeming] = useState(false)

  const loadCustomer = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await http.get<CustomerStats>(`/customers/${customerId}`)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      const c = res.data
      setCustomer(c)
      setName(c.name)
      setPhone(c.phone)
      setEmail(c.email || "")
      setCpf(c.cpf || "")
      setBirthDate(c.birth_date || "")
      setNotes(c.notes || "")
    }
  }

  const loadHistory = async () => {
    setLoadingHistory(true)
    const res = await http.get<EnrichedAppointmentHistory[]>(`/customers/${customerId}/appointments`)
    setLoadingHistory(false)

    if (res.data) {
      setHistory(res.data)
    }
  }

  const loadLoyalty = async () => {
    setLoadingLoyalty(true)
    // 1. Carrega programa de fidelidade da barbearia
    const progRes = await http.get<LoyaltyProgram>("/loyalty/program")
    if (progRes.data && progRes.data.active === 1) {
      setLoyaltyProgram(progRes.data)

      // 2. Carrega cartão de fidelidade do cliente
      const cardRes = await http.get<{ card: LoyaltyCard; transactions: LoyaltyTransaction[] }>(
        `/customers/${customerId}/loyalty`
      )
      if (cardRes.data) {
        setLoyaltyCard(cardRes.data.card)
        setLoyaltyTransactions(cardRes.data.transactions || [])
      } else {
        setLoyaltyCard(null)
        setLoyaltyTransactions([])
      }
    } else {
      setLoyaltyProgram(null)
      setLoyaltyCard(null)
      setLoyaltyTransactions([])
    }
    setLoadingLoyalty(false)
  }

  useEffect(() => {
    loadCustomer()
    loadHistory()
  }, [customerId])

  useEffect(() => {
    if (activeTab === "fidelidade") {
      loadLoyalty()
    }
  }, [activeTab, customerId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await http.put<CustomerStats>(`/customers/${customerId}`, {
      name,
      phone,
      email: email ? email : null,
      cpf: cpf ? cpf : null,
      birth_date: birthDate ? birthDate : null,
      notes: notes ? notes : null,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccessMsg("Dados do cliente atualizados com sucesso!")
    loadCustomer()
  }

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente este cliente da sua base de dados?")) {
      return
    }

    setDeleting(true)
    setErrorMsg(null)

    const res = await http.delete(`/customers/${customerId}`)
    setDeleting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/clientes")
  }

  const handleRedeem = async () => {
    setRedeeming(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await http.post<LoyaltyTransaction>(`/customers/${customerId}/loyalty/redeem`, {
      notes: redeemNotes || null,
    })
    setRedeeming(false)

    if (res.error) {
      setErrorMsg(res.error.message || "Erro ao realizar resgate")
      setShowRedeemModal(false)
      return
    }

    setSuccessMsg("Recompensa resgatada com sucesso!")
    setRedeemNotes("")
    setShowRedeemModal(false)
    loadLoyalty()
  }

  if (loading && !customer) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Verifica se o cliente tem saldo suficiente para o prêmio
  const stampsNeeded = loyaltyProgram?.stamps_to_reward || 10
  const pointsNeeded = loyaltyProgram?.stamps_to_reward || 100
  const hasReward = loyaltyProgram?.type === "stamps" 
    ? (loyaltyCard?.stamps_count || 0) >= stampsNeeded 
    : (loyaltyCard?.points_balance || 0) >= pointsNeeded

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Topo com retorno */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/cliente/clientes">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
              <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{customer?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Telefone: {customer?.phone}</p>
          </div>
        </div>

        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/40 bg-white text-xs font-bold" onClick={handleDelete} disabled={deleting}>
          <i className="ti ti-trash mr-1.5" /> Excluir Cliente
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="error">
          {errorMsg}
        </Alert>
      )}
      
      {successMsg && (
        <Alert variant="success">
          {successMsg}
        </Alert>
      )}

      {/* Cards de Métricas */}
      {customer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visitas Concluídas</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{customer.total_visits}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-lg">
                <i className="ti ti-calendar-check" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Investido</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">R$ {customer.total_spent.toFixed(2)}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg">
                <i className="ti ti-cash" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Última Visita</span>
                <span className="text-base font-black text-slate-800 mt-2 block">
                  {customer.last_visit ? new Date(customer.last_visit + "T00:00:00").toLocaleDateString("pt-BR") : "Nenhuma registrada"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-lg">
                <i className="ti ti-clock" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Customizadas State-based */}
      <div className="w-full">
        <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 max-w-[450px] mb-4">
          <button
            onClick={() => setActiveTab("cadastro")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "cadastro"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveTab("historico")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "historico"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Histórico ({history.length})
          </button>
          <button
            onClick={() => setActiveTab("fidelidade")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "fidelidade"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Fidelidade
          </button>
        </div>

        {activeTab === "cadastro" && (
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Cadastro</CardTitle>
              <CardDescription>Gerencie as informações pessoais, dados de contato e notas sobre o cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Nome Completo</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Celular (WhatsApp)</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">E-mail</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">CPF</label>
                    <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Data de Nascimento</label>
                    <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Observações Internas (Alergias, preferências, etc.)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva observações que ajudem no atendimento..."
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "historico" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atendimentos</CardTitle>
              <CardDescription>Histórico de visitas e serviços realizados pelo cliente.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="p-6 text-center text-slate-400">Carregando histórico...</div>
              ) : history.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-semibold">Nenhum atendimento registrado para este cliente.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Horário</th>
                        <th className="px-6 py-4">Serviços</th>
                        <th className="px-6 py-4">Profissional</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {new Date(h.date + "T00:00:00").toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{h.start_time.substring(0, 5)}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{h.services_list}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{h.professional_name}</td>
                          <td className="px-6 py-4 text-right font-extrabold text-slate-800">
                            R$ {h.total_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border capitalize ${
                                h.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : h.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-100"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {h.status === "completed" ? "Concluído" : h.status === "cancelled" ? "Cancelado" : h.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border capitalize ${
                                h.payment_status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {h.payment_status === "paid" ? "Pago" : "Pendente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "fidelidade" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {loadingLoyalty ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-8 animate-spin" /> Carregando cartão fidelidade...
              </div>
            ) : !loyaltyProgram ? (
              <Card className="border-dashed bg-slate-50/50">
                <CardContent className="p-8 text-center space-y-3">
                  <Award className="h-12 w-12 text-slate-400 mx-auto" />
                  <h3 className="font-extrabold text-slate-800">Programa de Fidelidade Inativo</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Configure um programa de fidelidade ativo em configurações para liberar o acompanhamento de carimbos e pontos dos clientes.
                  </p>
                  <Link href="/cliente/configuracoes/fidelidade" className="inline-block mt-2">
                    <Button size="sm">Configurar Fidelidade</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cartão de Fidelidade Visual */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="overflow-hidden border-border bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative shadow-xl">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                      <Award className="h-48 w-48" />
                    </div>
                    <CardHeader className="pb-2 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl tracking-wide font-black text-white">{loyaltyProgram.name}</CardTitle>
                          <CardDescription className="text-white/60 text-xs mt-0.5">Cartão Fidelidade de Cliente</CardDescription>
                        </div>
                        <div className="bg-white/10 text-white font-mono px-3 py-1 text-xs rounded-full border border-white/20">
                          {loyaltyCard?.status === "active" ? "ATIVO" : "INATIVO"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Portador</span>
                          <span className="text-lg font-black block mt-0.5">{customer?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Recompensa Alvo</span>
                          <span className="text-sm font-bold block text-primary mt-0.5">{loyaltyProgram.reward_description}</span>
                        </div>
                      </div>

                      {loyaltyProgram.type === "stamps" ? (
                        <div className="space-y-4">
                          <div className="flex justify-between text-xs font-bold text-white/70">
                            <span>Carimbos Acumulados</span>
                            <span>{loyaltyCard?.stamps_count || 0} de {stampsNeeded} carimbos</span>
                          </div>
                          
                          {/* Grid de Carimbos (Bolinhas) */}
                          <div className="flex flex-wrap gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 justify-center">
                            {Array.from({ length: stampsNeeded }).map((_, i) => {
                              const filled = i < (loyaltyCard?.stamps_count || 0)
                              return (
                                <div
                                  key={i}
                                  className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all ${
                                    filled
                                      ? "bg-primary border-primary text-slate-900 shadow-md shadow-primary/20 scale-105"
                                      : "bg-white/5 border-white/15 text-white/25"
                                  }`}
                                >
                                  {filled ? <Star className="h-5 w-5 fill-slate-900" /> : <span className="text-xs font-black">{i + 1}</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold text-white/70">
                            <span>Pontos Acumulados</span>
                            <span>{loyaltyCard?.points_balance || 0} / {pointsNeeded} pts</span>
                          </div>
                          
                          {/* Barra de Progresso */}
                          <div className="w-full bg-white/10 rounded-full h-3.5 border border-white/5 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(((loyaltyCard?.points_balance || 0) / pointsNeeded) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-white/40 block text-right font-medium">
                            Faltam {Math.max(pointsNeeded - (loyaltyCard?.points_balance || 0), 0)} pontos para resgatar.
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex justify-between items-center border-t border-white/10">
                        <span className="text-[10px] text-white/45 font-mono">ID Cartão: {loyaltyCard?.id || "Pendente de geração"}</span>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          className={`text-xs font-bold border rounded-lg h-9 px-4 ${
                            hasReward 
                              ? "bg-primary border-primary text-slate-900 hover:bg-primary/80" 
                              : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed hover:bg-white/5"
                          }`}
                          disabled={!hasReward || redeeming}
                          onClick={() => setShowRedeemModal(true)}
                        >
                          <Gift className="h-4 w-4 mr-1.5" /> Resgatar Prêmio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Histórico de Transações */}
                  <Card>
                    <CardHeader className="pb-3 flex justify-between flex-row items-center">
                      <div>
                        <CardTitle className="text-lg">Transações de Fidelidade</CardTitle>
                        <CardDescription>Histórico de créditos e débitos de carimbos/pontos.</CardDescription>
                      </div>
                      <History className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent className="p-0">
                      {loyaltyTransactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-semibold text-xs border-t">Nenhuma transação financeira ou de fidelidade registrada ainda.</div>
                      ) : (
                        <div className="overflow-x-auto border-t">
                          <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-400 font-bold uppercase bg-slate-50/50 border-b">
                              <tr>
                                <th className="px-6 py-3.5">Data/Hora</th>
                                <th className="px-6 py-3.5">Operação</th>
                                <th className="px-6 py-3.5 text-center">Valor</th>
                                <th className="px-6 py-3.5">Descrição</th>
                                <th className="px-6 py-3.5">Origem</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {loyaltyTransactions.map((tx) => {
                                const isEarn = tx.type === "earn"
                                const valStr = loyaltyProgram.type === "stamps"
                                  ? `${tx.stamps_value || 1} carimbo(s)`
                                  : `${tx.points_value || 0} pts`

                                return (
                                  <tr key={tx.id} className="hover:bg-slate-50/20 transition">
                                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-500">
                                      {new Date(tx.created_at).toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-3.5 text-xs font-bold">
                                      <span
                                        className={`inline-flex rounded-full px-2 py-0.5 font-bold border capitalize ${
                                          isEarn
                                            ? "bg-green-50 text-green-700 border-green-100"
                                            : "bg-red-50 text-red-700 border-red-100"
                                        }`}
                                      >
                                        {isEarn ? "Crédito" : "Resgate"}
                                      </span>
                                    </td>
                                    <td className={`px-6 py-3.5 text-xs font-extrabold text-center ${isEarn ? "text-green-600" : "text-red-600"}`}>
                                      {isEarn ? `+${valStr}` : `-${valStr}`}
                                    </td>
                                    <td className="px-6 py-3.5 text-xs font-medium text-slate-700">{tx.description}</td>
                                    <td className="px-6 py-3.5 text-xs text-slate-450 italic capitalize">{tx.created_by}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Explicativo e Regras */}
                <div className="space-y-6">
                  <Card className="bg-slate-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">Como Funciona?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs text-slate-500">
                      <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                        <p>
                          <strong>Acúmulo Automático:</strong> Toda vez que você concluir um agendamento para este cliente e registrar o pagamento como pago, o sistema incrementará os pontos/carimbos automaticamente.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                        <p>
                          <strong>Resgate Controlado:</strong> Quando o cliente atingir o limite estipulado, você poderá resgatar a recompensa clicando em "Resgatar Prêmio" para zerar os carimbos ou deduzir os pontos correspondentes.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                        <p>
                          <strong>Auditoria:</strong> Todos os créditos e débitos manuais ou automáticos ficam registrados para fins de segurança e transparência.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Resgate */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 border animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Confirmar Resgate
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Você está registrando o resgate da recompensa selecionada para o cliente.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prêmio / Recompensa</span>
              <span className="text-sm font-extrabold text-slate-800">{loyaltyProgram?.reward_description}</span>
              <span className="text-xs text-slate-450 block">
                Custo: {loyaltyProgram?.type === "stamps" ? `${stampsNeeded} carimbos` : `${pointsNeeded} pontos`}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Observações adicionais (opcional)</label>
              <textarea
                placeholder="Ex: Cliente preferiu resgatar corte hoje..."
                value={redeemNotes}
                onChange={(e) => setRedeemNotes(e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setShowRedeemModal(false)} className="h-9 px-4 text-xs font-bold border">
                Cancelar
              </Button>
              <Button size="sm" onClick={handleRedeem} disabled={redeeming} className="h-9 px-4 text-xs font-bold">
                {redeeming ? "Processando..." : "Confirmar Resgate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
