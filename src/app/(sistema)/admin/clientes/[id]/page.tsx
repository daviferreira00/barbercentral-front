"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
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

interface ClientUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

export default function AdminClienteDetailPage({ params }: { params: { id: string } }) {
  const clientId = params.id

  const [client, setClient] = useState<ClientSaaS | null>(null)
  const [users, setUsers] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dialog de Criação de Usuário
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("owner") // owner, manager, professional, receptionist
  const [userPassword, setUserPassword] = useState("")
  const [userSaving, setUserSaving] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const resClient = await http.get<ClientSaaS>(`/admin/clients/${clientId}`)
    const resUsers = await http.get<ClientUser[]>(`/admin/clients/${clientId}/users`)
    setLoading(false)

    if (resClient.error) {
      setErrorMsg(resClient.error.message)
      return
    }

    if (resClient.data) setClient(resClient.data)
    if (resUsers.data) setUsers(resUsers.data)
  }

  useEffect(() => {
    loadData()
  }, [clientId])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserError(null)

    if (!userName || !userEmail || !userPassword) {
      setUserError("Todos os campos são obrigatórios.")
      return
    }

    setUserSaving(true)
    const res = await http.post<ClientUser>(`/admin/clients/${clientId}/users`, {
      name: userName,
      email: userEmail,
      role: userRole,
      password: userPassword,
    })
    setUserSaving(false)

    if (res.error) {
      setUserError(res.error.message)
      return
    }

    setIsUserOpen(false)
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    loadData()
  }

  const handleUpdatePlan = async (newPlanId: string) => {
    if (!client) return
    const res = await http.put<ClientSaaS>(`/admin/clients/${client.id}`, {
      name: client.name,
      slug: client.slug,
      plan_id: newPlanId,
    })

    if (res.error) {
      alert(res.error.message)
      return
    }
    loadData()
  }

  if (loading && !client) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <a href="/admin/clientes" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Detalhes da barbearia e gerenciamento de equipe.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Informações Barbearia */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>Plano e status de assinatura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Slug da Barbearia</span>
              <p className="text-sm font-mono bg-slate-50 border border-slate-100 p-2 rounded text-slate-700">
                {client.slug}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    client.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {client.status === "active" ? "Ativo" : "Bloqueado"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Plano Selecionado</span>
              <Select value={client.plan_id} onValueChange={handleUpdatePlan}>
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
          </CardContent>
        </Card>

        {/* Card Usuários / Colaboradores */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center flex-wrap gap-2">
            <div>
              <CardTitle>Usuários Associados</CardTitle>
              <CardDescription>Pessoas com permissão de acesso ao painel desta barbearia.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsUserOpen(true)} className="flex items-center gap-1.5">
              <i className="ti ti-plus text-base" />
              Adicionar Usuário
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <i className="ti ti-users text-3xl" />
                <span className="text-sm font-semibold">Nenhum usuário cadastrado nesta barbearia.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-4 pl-6">Nome</th>
                      <th className="p-4">E-mail</th>
                      <th className="p-4">Função (Role)</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30">
                        <td className="p-4 pl-6 font-bold text-slate-800">{u.name}</td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4 capitalize">{u.role}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            {u.status}
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
      </div>

      {/* Dialog Novo Usuário */}
      <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <Input
                placeholder="Ex: João Silva"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <Input
                type="email"
                placeholder="joao@barberiamodelo.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Função (Role)</label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Dono (Owner)</SelectItem>
                  <SelectItem value="manager">Gerente (Manager)</SelectItem>
                  <SelectItem value="professional">Profissional (Professional)</SelectItem>
                  <SelectItem value="receptionist">Recepcionista (Receptionist)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Senha Temporária</label>
              <Input
                type="password"
                placeholder="Defina uma senha provisória"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                required
              />
            </div>

            {userError && <Alert variant="error" message={userError} />}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUserOpen(false)}
                disabled={userSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={userSaving}>
                {userSaving ? "Adicionando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
