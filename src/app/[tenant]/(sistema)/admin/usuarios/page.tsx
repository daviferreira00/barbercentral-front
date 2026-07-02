"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus, Pencil, Trash2, ShieldAlert, User, Shield, Building2, Search, Loader2 } from "lucide-react"

interface ClientSaaS {
  id: string
  name: string
  slug: string
  status: string
}

interface AdminUser {
  id: string
  type: "admin" | "client"
  name: string
  email: string
  role?: string
  status?: string
  client_id?: string
  client_name?: string
  created_at: string
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [clients, setClients] = useState<ClientSaaS[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "admin" | "client">("all")

  // Modal Novo / Editar Usuário
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserType, setEditingUserType] = useState<"admin" | "client">("client")

  // Campos do Formulário
  const [formType, setFormType] = useState<"admin" | "client">("client")
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("owner")
  const [formStatus, setFormStatus] = useState("active")
  const [formClientId, setFormClientId] = useState("")

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Modal Exclusão
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const [usersRes, clientsRes] = await Promise.all([
      http.get<AdminUser[]>("/admin/users"),
      http.get<ClientSaaS[]>("/admin/clients")
    ])
    setLoading(false)

    if (usersRes.error) {
      setErrorMsg(usersRes.error.message)
      return
    }

    if (usersRes.data) setUsers(usersRes.data)
    if (clientsRes.data) {
      setClients(clientsRes.data)
      if (clientsRes.data.length > 0) {
        setFormClientId(clientsRes.data[0].id)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateDialog = () => {
    setIsEditMode(false)
    setEditingUserId(null)
    setFormType("client")
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("owner")
    setFormStatus("active")
    if (clients.length > 0) {
      setFormClientId(clients[0].id)
    } else {
      setFormClientId("")
    }
    setSaveError(null)
    setIsOpen(true)
  }

  const openEditDialog = (u: AdminUser) => {
    setIsEditMode(true)
    setEditingUserId(u.id)
    setEditingUserType(u.type)
    setFormType(u.type)
    setFormName(u.name)
    setFormEmail(u.email)
    setFormPassword("") // password empty means no change
    setFormRole(u.role || "owner")
    setFormStatus(u.status || "active")
    setFormClientId(u.client_id || (clients.length > 0 ? clients[0].id : ""))
    setSaveError(null)
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!formName || !formEmail) {
      setSaveError("Nome e e-mail são obrigatórios.")
      return
    }

    if (!isEditMode && !formPassword) {
      setSaveError("Senha é obrigatória para novos usuários.")
      return
    }

    if (formType === "client" && !formClientId) {
      setSaveError("Selecione uma barbearia para o usuário.")
      return
    }

    setSaving(true)
    let res

    if (isEditMode && editingUserId) {
      // Edição
      res = await http.put(`/admin/users/${editingUserType}/${editingUserId}`, {
        name: formName,
        email: formEmail,
        password: formPassword || undefined,
        role: formType === "client" ? formRole : undefined,
        status: formType === "client" ? formStatus : undefined,
        client_id: formType === "client" ? formClientId : undefined,
      })
    } else {
      // Criação
      res = await http.post("/admin/users", {
        type: formType,
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formType === "client" ? formRole : undefined,
        client_id: formType === "client" ? formClientId : undefined,
      })
    }

    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    setIsOpen(false)
    loadData()
  }

  const openDeleteDialog = (u: AdminUser) => {
    setDeleteTarget(u)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    const res = await http.delete(`/admin/users/${deleteTarget.type}/${deleteTarget.id}`)
    setDeleting(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsDeleteOpen(false)
    setDeleteTarget(null)
    loadData()
  }

  // Filtragem dos usuários listados
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || u.type === typeFilter

    return matchesSearch && matchesType
  })

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return "Dono"
      case "manager":
        return "Gerente"
      case "professional":
        return "Profissional"
      case "receptionist":
        return "Recepcionista"
      case "admin":
        return "Administrador"
      default:
        return role || "N/A"
    }
  }

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-50 text-purple-700 border-purple-100"
      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-100"
      case "professional":
        return "bg-cyan-50 text-cyan-700 border-cyan-100"
      case "receptionist":
        return "bg-amber-50 text-amber-700 border-amber-100"
      case "admin":
        return "bg-rose-50 text-rose-700 border-rose-100"
      default:
        return "bg-slate-50 text-slate-700 border-slate-100"
    }
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie administradores da plataforma e funcionários vinculados às barbearias.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="error" className="bg-red-50 text-red-800 border-red-200">
          <ShieldAlert className="h-4 w-4" />
          <span>{errorMsg}</span>
        </Alert>
      )}

      {/* Filtros e Busca */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Filtrar Tipo:
            </span>
            <Select
              value={typeFilter}
              onValueChange={(val) => setTypeFilter(val as any)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="client">Usuários de Barbearia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="text-sm font-semibold text-slate-500">
                Carregando usuários...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Nome / E-mail</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Barbearia Vinculada</th>
                    <th className="p-4">Função / Cargo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition duration-150">
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{u.name}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.type === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">
                            <Shield className="h-3 w-3" /> Admin Central
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5">
                            <User className="h-3 w-3" /> Barbearia
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.type === "admin" ? (
                          <span className="text-slate-400 italic font-medium">N/A (Plataforma)</span>
                        ) : (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{u.client_name || "Sem Vínculo"}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.type === "admin" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            Ativo
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                              u.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : u.status === "inactive"
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {u.status === "active"
                              ? "Ativo"
                              : u.status === "inactive"
                              ? "Inativo"
                              : "Pendente"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(u)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(u)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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

      {/* Radix Dialog para Criação / Edição */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {isEditMode ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Preencha os campos abaixo para configurar os acessos e vinculações.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {saveError && (
              <Alert variant="error" className="bg-red-50 text-red-800 border-red-200 py-2.5">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-xs">{saveError}</span>
              </Alert>
            )}

            {/* Tipo de Usuário (Apenas na Criação) */}
            {!isEditMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tipo de Conta
                </label>
                <Select
                  value={formType}
                  onValueChange={(val) => setFormType(val as any)}
                >
                  <SelectTrigger className="border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Funcionário de Barbearia</SelectItem>
                    <SelectItem value="admin">Administrador da Plataforma (Admin Central)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nome Completo
              </label>
              <Input
                placeholder="Ex: Carlos Eduardo"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border-slate-200"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                E-mail de Acesso
              </label>
              <Input
                type="email"
                placeholder="carlos@exemplo.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="border-slate-200"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Senha</span>
                {isEditMode && (
                  <span className="text-[10px] text-slate-400 lowercase font-medium">
                    (deixe em branco para não alterar)
                  </span>
                )}
              </label>
              <Input
                type="password"
                placeholder={isEditMode ? "••••••••" : "Defina a senha de acesso"}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="border-slate-200"
              />
            </div>

            {/* Se for usuário de barbearia (client) */}
            {formType === "client" && (
              <>
                {/* Seleção de Barbearia (Vínculo) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Vincular à Barbearia / Cliente
                  </label>
                  <Select
                    value={formClientId}
                    onValueChange={setFormClientId}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Selecione a barbearia" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Função (Role) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cargo / Nível de Acesso
                  </label>
                  <Select
                    value={formRole}
                    onValueChange={setFormRole}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Dono da Barbearia</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="professional">Profissional / Barbeiro</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                {isEditMode && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status da Conta
                    </label>
                    <Select
                      value={formStatus}
                      onValueChange={setFormStatus}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente (Primeiro acesso)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <DialogFooter className="pt-4 border-t border-slate-100 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-slate-200 text-slate-500 font-medium"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="font-semibold shadow-sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Radix de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold text-lg">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-1">
              Tem certeza que deseja excluir o usuário <span className="font-semibold text-slate-700">{deleteTarget?.name}</span>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-200 text-slate-500 font-medium"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="font-semibold shadow-sm"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
