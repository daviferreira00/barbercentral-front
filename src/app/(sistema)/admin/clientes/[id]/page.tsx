"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Pencil, Trash2, Plus, ArrowLeft, Palette } from "lucide-react"
import Link from "next/link"

interface ClientSaaS {
  id: string
  plan_id: string
  name: string
  slug: string
  custom_domain?: string | null
  status: string
  phone?: string | null
  created_at: string
}

interface Plan {
  id: string
  name: string
  price: number
}

// 1 linha = 1 vínculo (client_user_link); id = link_id. O mesmo e-mail pode
// estar vinculado a outras barbearias sem aparecer aqui.
interface ClientUser {
  id: string
  user_id?: string
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

interface ClientConfig {
  client_id: string
  color_primary: string
  color_secondary: string
  font_family: string
  logo_url?: string

  address?: string
  neighborhood?: string
  city?: string
  state?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  timezone: string
  cancellation_policy_hours: number
  booking_requires_login: number
  min_advance_hours: number
  max_advance_days: number
  interval_between_minutes: number
}

export default function AdminClienteDetailPage({ params }: { params: { id: string } }) {
  const clientId = params.id

  const [client, setClient] = useState<ClientSaaS | null>(null)
  const [users, setUsers] = useState<ClientUser[]>([])
  const [config, setConfig] = useState<ClientConfig | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Client edit state
  const [editClientName, setEditClientName] = useState("")
  const [editClientSlug, setEditClientSlug] = useState("")
  const [editClientDomain, setEditClientDomain] = useState("")
  const [editClientPhone, setEditClientPhone] = useState("")
  const [editClientPlan, setEditClientPlan] = useState("")
  const [clientSaving, setClientSaving] = useState(false)


  // Dialog de Criação de Usuário
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("owner")
  const [userPassword, setUserPassword] = useState("")
  const [userSaving, setUserSaving] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)

  // Dialog de Edição de Usuário
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<ClientUser | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Dialog de Exclusão
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<ClientUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [resClient, resUsers, resConfig, resPlans] = await Promise.all([
      http.get<ClientSaaS>(`/admin/clients/${clientId}`),
      http.get<ClientUser[]>(`/admin/clients/${clientId}/users`),
      http.get<ClientConfig>(`/admin/clients/${clientId}/config`),
      http.get<Plan[]>("/admin/plans")
    ])
    setLoading(false)

    if (resClient.error) {
      setErrorMsg(resClient.error.message)
      return
    }

    if (resClient.data) {
      setClient(resClient.data)
      setEditClientName(resClient.data.name)
      setEditClientSlug(resClient.data.slug)
      setEditClientDomain(resClient.data.custom_domain || "")
      setEditClientPhone(resClient.data.phone || "")
      setEditClientPlan(resClient.data.plan_id)
    }
    if (resUsers.data) setUsers(resUsers.data)
    if (resPlans.data) setPlans(resPlans.data)
    if (resConfig.data) {
      setConfig(resConfig.data)
    }
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

  const openEditDialog = (u: ClientUser) => {
    setEditUser(u)
    setEditName(u.name)
    setEditEmail(u.email)
    setEditRole(u.role)
    setEditStatus(u.status)
    setEditError(null)
    setIsEditOpen(true)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setEditError(null)

    if (!editName || !editEmail || !editRole || !editStatus) {
      setEditError("Todos os campos são obrigatórios.")
      return
    }

    setEditSaving(true)
    const res = await http.put(`/admin/clients/${clientId}/users/${editUser.id}`, {
      name: editName,
      email: editEmail,
      role: editRole,
      status: editStatus,
    })
    setEditSaving(false)

    if (res.error) {
      setEditError(res.error.message)
      return
    }

    setIsEditOpen(false)
    setEditUser(null)
    loadData()
  }

  const openDeleteDialog = (u: ClientUser) => {
    setDeleteUser(u)
    setIsDeleteOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return

    setDeleting(true)
    const res = await http.delete(`/admin/clients/${clientId}/users/${deleteUser.id}`)
    setDeleting(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsDeleteOpen(false)
    setDeleteUser(null)
    loadData()
  }

  const handleUpdateClient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!client) return
    setClientSaving(true)
    const res = await http.put<ClientSaaS>(`/admin/clients/${client.id}`, {
      name: editClientName,
      slug: editClientSlug,
      custom_domain: editClientDomain || null,
      plan_id: editClientPlan,
      phone: editClientPhone || null,
    })
    setClientSaving(false)

    if (res.error) {
      alert(res.error.message)
      return
    }
    loadData()
  }


  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; style: string }> = {
      owner: { label: "Dono", style: "bg-indigo-50 text-indigo-700 border-indigo-100" },
      manager: { label: "Gerente", style: "bg-blue-50 text-blue-700 border-blue-100" },
      professional: { label: "Profissional", style: "bg-amber-50 text-amber-700 border-amber-100" },
      receptionist: { label: "Recepcionista", style: "bg-slate-50 text-slate-600 border-slate-200" },
    }
    const info = map[role] || { label: role, style: "bg-slate-50 text-slate-600 border-slate-200" }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${info.style}`}>
        {info.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-100">
        Inativo
      </span>
    )
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <a href="/admin/clientes" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Detalhes da barbearia e personalização.</p>
          </div>
        </div>
        <Link href={`/admin/clientes/${clientId}/layout`}>
          <Button variant="outline" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Configurar Layout
          </Button>
        </Link>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Informações Barbearia */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>Informações e assinatura.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nome Comercial</span>
                <Input value={editClientName} onChange={e => setEditClientName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Slug da Barbearia</span>
                <Input value={editClientSlug} onChange={e => setEditClientSlug(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Domínio Customizado</span>
                <Input placeholder="ex: agendamento.barbeariadopovo.com" value={editClientDomain} onChange={e => setEditClientDomain(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Telefone Administrativo</span>
                <Input placeholder="ex: 11999999999" value={editClientPhone} onChange={e => setEditClientPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${client.status === "active"
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
                <Select value={editClientPlan} onValueChange={setEditClientPlan}>
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

              <Button type="submit" className="w-full" disabled={clientSaving}>
                {clientSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
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
              <Plus className="h-4 w-4" />
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
                      <th className="p-4">Função</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30">
                        <td className="p-4 pl-6 font-bold text-slate-800">{u.name}</td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4">{getRoleBadge(u.role)}</td>
                        <td className="p-4">{getStatusBadge(u.status)}</td>
                        <td className="p-4 pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(u)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(u)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
              <p className="text-[11px] text-slate-400">
                Se este e-mail já existir na plataforma, apenas um novo vínculo com esta
                barbearia será criado — nome e senha atuais do usuário são mantidos.
              </p>
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

      {/* Dialog Editar Usuário */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Função (Role)</label>
              <Select value={editRole} onValueChange={setEditRole}>
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
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editError && <Alert variant="error" message={editError} />}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                disabled={editSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Vínculo</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-slate-600">
              Tem certeza que deseja remover o vínculo de <strong className="text-slate-800">{deleteUser?.name}</strong> com
              esta barbearia?
            </p>
            <p className="text-xs text-red-500 font-semibold">
              Esta ação não pode ser desfeita. Vínculos com outras barbearias não são afetados.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? "Removendo..." : "Remover Vínculo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
