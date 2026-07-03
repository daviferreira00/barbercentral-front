"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import { useApp } from "@/shared/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { ShieldCheck, Plus, Settings, AlertTriangle, UserMinus, ShieldAlert, Loader2 } from "lucide-react"

interface ClientSaaS {
  id: string
  plan_id: string
  name: string
  slug: string
  status: string
  created_at: string
}

interface Plan {
  id: string
  name: string
  price: number
}

export default function AdminClientesPage() {
  const router = useRouter()
  const { refreshSession } = useApp()

  const [clients, setClients] = useState<ClientSaaS[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newCustomDomain, setNewCustomDomain] = useState("")
  const [newPlan, setNewPlan] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Dialog de Alteração de Plano
  const [selectedClient, setSelectedClient] = useState<ClientSaaS | null>(null)
  const [isPlanOpen, setIsPlanOpen] = useState(false)
  const [changePlanId, setChangePlanId] = useState("")
  const [updatingPlan, setUpdatingPlan] = useState(false)

  // Dialog de Bloqueio/Desbloqueio com Motivo
  const [blockClientTarget, setBlockClientTarget] = useState<ClientSaaS | null>(null)
  const [blockAction, setBlockAction] = useState<"block" | "unblock">("block")
  const [blockReason, setBlockReason] = useState("")
  const [isBlockOpen, setIsBlockOpen] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const [clientsRes, plansRes] = await Promise.all([
      http.get<ClientSaaS[]>("/admin/clients"),
      http.get<Plan[]>("/admin/plans")
    ])
    setLoading(false)

    if (clientsRes.error) {
      setErrorMsg(clientsRes.error.message)
      return
    }

    if (clientsRes.data) setClients(clientsRes.data)
    if (plansRes.data) {
      setPlans(plansRes.data)
      if (plansRes.data.length > 0) {
        setNewPlan(plansRes.data[0].id)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!newName || !newSlug || !newPlan) {
      setSaveError("Nome, slug e plano são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.post<ClientSaaS>("/admin/clients", {
      name: newName,
      slug: newSlug,
      custom_domain: newCustomDomain || null,
      plan_id: newPlan,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    setIsCreateOpen(false)
    setNewName("")
    setNewSlug("")
    setNewCustomDomain("")
    loadData()
  }

  const openBlockDialog = (client: ClientSaaS, action: "block" | "unblock") => {
    setBlockClientTarget(client)
    setBlockAction(action)
    setBlockReason("")
    setIsBlockOpen(true)
  }

  const handleBlockConfirm = async () => {
    if (!blockClientTarget) return

    setBlocking(true)
    const res = await http.post<{ ok: boolean }>(
      `/admin/clients/${blockClientTarget.id}/${blockAction}`,
      { reason: blockReason }
    )
    setBlocking(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsBlockOpen(false)
    loadData()
  }

  const openPlanDialog = (client: ClientSaaS) => {
    setSelectedClient(client)
    setChangePlanId(client.plan_id)
    setIsPlanOpen(true)
  }

  const handleChangePlan = async () => {
    if (!selectedClient || !changePlanId) return

    setUpdatingPlan(true)
    const res = await http.put<{ ok: boolean }>(
      `/admin/clients/${selectedClient.id}/plan`,
      { plan_id: changePlanId }
    )
    setUpdatingPlan(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsPlanOpen(false)
    loadData()
  }

  const handleImpersonate = async (client: ClientSaaS) => {
    const host = window.location.host
    const protocol = window.location.protocol

    if (host.includes("localhost")) {
      const port = host.split(":")[1] || "3002"
      window.location.href = `${protocol}//${client.slug}.localhost:${port}/login`
    } else {
      const parts = host.split(".")
      if (parts.length > 2) {
        parts[0] = client.slug
        window.location.href = `${protocol}//${parts.join(".")}/login`
      } else {
        window.location.href = `${protocol}//${client.slug}.${host}/login`
      }
    }
  }

  const getPlanName = (planId: string) => {
    const p = plans.find((x) => x.id === planId)
    return p ? p.name : "Personalizado"
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Barbearias (Clientes SaaS)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualizar e gerenciar as barbearias integradas ao SaaS BarberCentral.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/planos">
            <Button variant="outline" className="flex items-center gap-2 font-bold h-9 text-xs">
              <Settings className="h-4 w-4" /> Gerenciar Planos
            </Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 font-bold h-9 text-xs">
            <Plus className="h-4 w-4" /> Nova Barbearia
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="error">
          {errorMsg}
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-bold mt-2">Buscando barbearias da plataforma...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <span className="font-semibold">Nenhuma barbearia cadastrada no momento.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 pl-6">Nome</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Plano Contratado</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Cadastro</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-slate-800 block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">{c.slug}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-100">
                          {getPlanName(c.plan_id)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100"
                            }`}
                        >
                          {c.status === "active" ? "Ativo" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPlanDialog(c)}
                          className="text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          Alterar Plano
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBlockDialog(c, c.status === "active" ? "block" : "unblock")}
                          className={c.status === "active" ? "text-red-650 hover:bg-red-50 font-bold" : "text-emerald-600 hover:bg-emerald-50 font-bold"}
                        >
                          {c.status === "active" ? "Bloquear" : "Desbloquear"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/clientes/${c.id}`)}
                          className="text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          Gerenciar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonate(c)}
                          className="text-indigo-650 hover:bg-indigo-50 font-bold"
                        >
                          Acessar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nova Barbearia */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Barbearia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Comercial</label>
              <Input
                placeholder="Ex: Barbearia do Povo"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  setNewSlug(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "")
                  )
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Slug URL</label>
              <Input
                placeholder="ex-barbearia-do-povo"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Domínio Customizado (Opcional)</label>
              <Input
                placeholder="ex: agendamento.barbeariadopovo.com"
                value={newCustomDomain}
                onChange={(e) => setNewCustomDomain(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Plano SaaS</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (R$ {p.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {saveError && <Alert variant="error">{saveError}</Alert>}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar Barbearia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Plano */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Plano SaaS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-slate-50 rounded-xl border text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Barbearia</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">{selectedClient?.name}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Novo Plano</label>
              <Select value={changePlanId} onValueChange={setChangePlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (R$ {p.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPlanOpen(false)}
                disabled={updatingPlan}
              >
                Cancelar
              </Button>
              <Button onClick={handleChangePlan} disabled={updatingPlan}>
                {updatingPlan ? "Alterando..." : "Salvar Alteração"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Bloqueio/Desbloqueio com Motivo */}
      <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {blockAction === "block" ? "Bloquear Barbearia" : "Desbloquear Barbearia"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-slate-50 rounded-xl border text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Barbearia</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">{blockClientTarget?.name}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Motivo / Justificativa</label>
              <textarea
                placeholder="Informe o motivo desta ação administrativa..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                required
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsBlockOpen(false)}
                disabled={blocking}
              >
                Cancelar
              </Button>
              <Button onClick={handleBlockConfirm} disabled={blocking}>
                {blocking ? "Processando..." : blockAction === "block" ? "Bloquear Acesso" : "Desbloquear Acesso"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
