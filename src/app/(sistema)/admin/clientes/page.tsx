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

interface ClientSaaS {
  id: string
  plan_id: string
  name: string
  slug: string
  status: string
  created_at: string
}

export default function AdminClientesPage() {
  const router = useRouter()
  const { refreshSession } = useApp()

  const [clients, setClients] = useState<ClientSaaS[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dialog de Criação
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newPlan, setNewPlan] = useState("plan-profissional") // plan-basico, plan-profissional, plan-premium
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadClients = async () => {
    setLoading(true)
    const res = await http.get<ClientSaaS[]>("/admin/clients")
    setLoading(false)
    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }
    if (res.data) {
      setClients(res.data)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!newName || !newSlug) {
      setSaveError("Nome e slug são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.post<ClientSaaS>("/admin/clients", {
      name: newName,
      slug: newSlug,
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
    loadClients()
  }

  const toggleStatus = async (client: ClientSaaS) => {
    const action = client.status === "active" ? "block" : "unblock"
    const res = await http.post<{ ok: boolean }>(`/admin/clients/${client.id}/${action}`, {})

    if (res.error) {
      alert(res.error.message)
      return
    }
    loadClients()
  }

  const handleImpersonate = async (clientId: string) => {
    setLoading(true)
    const res = await http.post<{ ok: boolean }>(`/admin/impersonate/${clientId}`, {})
    if (res.error) {
      setLoading(false)
      alert(res.error.message)
      return
    }

    // Atualiza a sessão e navega para o painel do cliente
    await refreshSession()
    router.push("/cliente")
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Barbearias Cadastradas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualizar e gerenciar as barbearias integradas ao SaaS BarberCentral.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 font-semibold">
          <i className="ti ti-plus text-base" />
          Nova Barbearia
        </Button>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs font-bold mt-2">Buscando barbearias...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <i className="ti ti-building-store text-4xl" />
              <span className="font-semibold">Nenhuma barbearia cadastrada no momento.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 pl-6">Nome</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Plano</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Cadastro</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6">
                        <a
                          href={`/admin/clientes/${c.id}`}
                          className="font-bold text-slate-800 hover:text-primary hover:underline"
                        >
                          {c.name}
                        </a>
                      </td>
                      <td className="p-4 font-mono text-xs">{c.slug}</td>
                      <td className="p-4 capitalize">
                        {c.plan_id.replace("plan-", "")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            c.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {c.status === "active" ? "Ativo" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(c)}
                          className={c.status === "active" ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}
                        >
                          <i className={`ti ti-shield-${c.status === "active" ? "off" : "check"} text-base mr-1`} />
                          {c.status === "active" ? "Bloquear" : "Desbloquear"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonate(c.id)}
                          className="text-indigo-600 hover:bg-indigo-50"
                        >
                          <i className="ti ti-login text-base mr-1" />
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

      {/* Modal/Dialog Nova Barbearia */}
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
                  // Gera auto-slug
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
              <label className="text-xs font-bold text-slate-500 uppercase">Plano SaaS</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan-basico">Básico</SelectItem>
                  <SelectItem value="plan-profissional">Profissional</SelectItem>
                  <SelectItem value="plan-premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {saveError && <Alert variant="error" message={saveError} />}

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
    </div>
  )
}
