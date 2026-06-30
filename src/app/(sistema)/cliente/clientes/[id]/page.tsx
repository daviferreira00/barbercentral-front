"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const [activeTab, setActiveTab] = useState<"cadastro" | "historico">("cadastro")

  // Edit fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [notes, setNotes] = useState("")

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

  useEffect(() => {
    loadCustomer()
    loadHistory()
  }, [customerId])

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

  if (loading && !customer) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

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

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

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
        <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 max-w-[400px] mb-4">
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
        </div>

        {activeTab === "cadastro" && (
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Cadastro</CardTitle>
              <CardDescription>Modifique as informações pessoais do cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">E-mail (Opcional)</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CPF (Opcional)</label>
                    <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data de Nascimento (Opcional)</label>
                  <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Observações Internas (Opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                  <Button type="submit" disabled={saving} className="font-bold">
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
      </div>
    </div>
  )
}
