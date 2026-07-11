"use client"

import { useEffect, useState, useRef } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WhatsAppInstance {
  id: string
  instance_name: string
  client_id?: string
  professional_id?: string
  created_at?: string
  updated_at?: string

  // Join fields
  client_name?: string
  client_slug?: string
  professional_name?: string

  // Status fields
  connection_status: "open" | "close" | "connecting"
  owner_jid?: string
  profile_pic_url?: string
  number?: string
}

interface ClientRef {
  id: string
  name: string
  slug: string
}

interface UserRef {
  id: string
  user_id: string
  name: string
  email: string
  role: string
}

export default function WhatsAppAdminPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal: Criar Instância
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  // Modal: QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  
  // Modal: Vincular Instância
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkInstanceName, setLinkInstanceName] = useState<string | null>(null)
  const [clients, setClients] = useState<ClientRef[]>([])
  const [professionals, setProfessionals] = useState<UserRef[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("")
  const [linkLoading, setLinkLoading] = useState(false)
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const loadInstances = async () => {
    setLoading(true)
    setError(null)
    const res = await http.get<{ data: WhatsAppInstance[] }>("/admin/whatsapp")
    if (res.error) {
      setError(res.error.message)
    } else if (res.data) {
      const rawData = (res.data as any).data || res.data
      setInstances(Array.isArray(rawData) ? rawData : [])
    }
    setLoading(false)
  }

  const loadClients = async () => {
    const res = await http.get<{ data: ClientRef[] }>("/admin/clients")
    if (res.data) {
      const rawData = (res.data as any).data || res.data
      setClients(Array.isArray(rawData) ? rawData : [])
    }
  }

  const loadProfessionals = async (clientId: string) => {
    if (!clientId) {
      setProfessionals([])
      return
    }
    const res = await http.get<{ data: UserRef[] }>(`/admin/clients/${clientId}/users`)
    if (res.data) {
      const rawData = (res.data as any).data || res.data
      setProfessionals(Array.isArray(rawData) ? rawData : [])
    }
  }

  useEffect(() => {
    loadInstances()
    loadClients()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Poll connection status of the instance when QR Code modal is open
  useEffect(() => {
    if (qrModalOpen && selectedInstanceName) {
      pollingRef.current = setInterval(async () => {
        const res = await http.get<any>(`/admin/whatsapp/state/${encodeURIComponent(selectedInstanceName)}`)
        if (res.data) {
          const stateData = res.data.data || res.data
          const state = stateData.instance?.state || stateData.state
          if (state === "open") {
            if (pollingRef.current) clearInterval(pollingRef.current)
            setQrModalOpen(false)
            setQrCodeBase64(null)
            setSelectedInstanceName(null)
            loadInstances()
          }
        }
      }, 4000)
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [qrModalOpen, selectedInstanceName])

  // Trigger professional load on client select
  useEffect(() => {
    loadProfessionals(selectedClientId)
    setSelectedProfessionalId("")
  }, [selectedClientId])

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInstanceName.trim()) return

    setCreateLoading(true)
    const res = await http.post<{ data: any }>("/admin/whatsapp", { instance_name: newInstanceName })
    setCreateLoading(false)

    if (res.error) {
      alert(res.error.message)
    } else {
      setCreateModalOpen(false)
      const createdName = newInstanceName
      setNewInstanceName("")
      await loadInstances()
      handleShowQr(createdName)
    }
  }

  const handleShowQr = async (name: string) => {
    setSelectedInstanceName(name)
    setQrCodeBase64(null)
    setQrModalOpen(true)
    setQrLoading(true)

    const res = await http.get<any>(`/admin/whatsapp/connect/${encodeURIComponent(name)}`)
    setQrLoading(false)

    if (res.error) {
      alert(res.error.message)
      setQrModalOpen(false)
    } else if (res.data) {
      const connData = res.data.data || res.data
      const state = connData.instance?.state || connData.state
      
      if (state === "open") {
        alert("Esta instância já está conectada!")
        setQrModalOpen(false)
        loadInstances()
      } else if (connData.base64) {
        setQrCodeBase64(connData.base64)
      } else if (connData.qrcode?.base64) {
        setQrCodeBase64(connData.qrcode.base64)
      } else {
        alert("Não foi possível carregar o QR Code. Tente novamente.")
        setQrModalOpen(false)
      }
    }
  }

  const handleLogoutInstance = async (name: string) => {
    if (!confirm(`Deseja desconectar o WhatsApp da instância "${name}"?`)) return

    const res = await http.delete<{ data: any }>(`/admin/whatsapp/logout/${encodeURIComponent(name)}`)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadInstances()
    }
  }

  const handleDeleteInstance = async (name: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a instância "${name}"? Todas as sessões serão apagadas.`)) return

    const res = await http.delete<{ data: any }>(`/admin/whatsapp/${encodeURIComponent(name)}`)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadInstances()
    }
  }

  const openLinkModal = (instance: WhatsAppInstance) => {
    setLinkInstanceName(instance.instance_name)
    setSelectedClientId(instance.client_id || "")
    setSelectedProfessionalId(instance.professional_id || "")
    setLinkModalOpen(true)
  }

  const handleLinkInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkInstanceName) return

    setLinkLoading(true)
    const res = await http.post("/admin/whatsapp/link", {
      instance_name: linkInstanceName,
      client_id: selectedClientId || null,
      professional_id: selectedProfessionalId || null
    })
    setLinkLoading(false)

    if (res.error) {
      alert(res.error.message)
    } else {
      setLinkModalOpen(false)
      setLinkInstanceName(null)
      loadInstances()
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString("pt-BR")
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return "-"
    return `+${phone.split("@")[0]}`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <i className="ti ti-brand-whatsapp text-emerald-500 text-3xl" />
            Conexões WhatsApp
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e vincule instâncias da Evolution API a barbearias e profissionais.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/10 transition-all"
        >
          <i className="ti ti-plus text-base" />
          Nova Instância
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <i className="ti ti-alert-circle text-xl" />
          <div>
            <span className="font-bold">Erro ao carregar dados: </span>
            {error}
          </div>
        </div>
      )}

      {/* Instances Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-9 bg-slate-200 rounded flex-1" />
                <div className="h-9 bg-slate-200 rounded w-10" />
              </div>
            </div>
          ))}
        </div>
      ) : instances.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-brand-whatsapp text-slate-400 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma conexão encontrada</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Crie sua primeira instância do WhatsApp para começar a enviar mensagens e configurar as vinculações.
          </p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl"
          >
            Criar Instância
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => {
            const isConnected = instance.connection_status === "open"
            return (
              <div
                key={instance.id}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-6 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top section: Avatar & Connection status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {instance.profile_pic_url ? (
                        <img
                          src={instance.profile_pic_url}
                          alt={instance.instance_name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                          {instance.instance_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 truncate max-w-[150px]" title={instance.instance_name}>
                          {instance.instance_name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {instance.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                      {isConnected ? "Conectado" : "Desconectado"}
                    </span>
                  </div>

                  {/* Body: Meta info & Link details */}
                  <div className="mt-6 border-t border-slate-100 pt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telefone:</span>
                      <span className="font-semibold text-slate-800">
                        {instance.number ? formatPhone(instance.number) : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 font-medium">Vínculo:</span>
                      <div className="text-right">
                        {instance.client_name ? (
                          <div className="font-bold text-indigo-650 truncate max-w-[150px]">
                            {instance.client_name}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">Sem barbearia</div>
                        )}
                        {instance.professional_name && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Prof: {instance.professional_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Sincronizado:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(instance.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  {isConnected ? (
                    <Button
                      onClick={() => handleLogoutInstance(instance.instance_name)}
                      variant="outline"
                      className="flex-1 text-xs border-slate-200 hover:bg-slate-50 text-slate-750 h-9 font-semibold"
                    >
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleShowQr(instance.instance_name)}
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-9 font-semibold flex items-center justify-center gap-1"
                    >
                      <i className="ti ti-qrcode" />
                      Conectar (QR)
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => openLinkModal(instance)}
                    variant="outline"
                    className="border-slate-200 text-indigo-600 hover:bg-indigo-50 h-9 px-3"
                    title="Vincular a Barbearia/Profissional"
                  >
                    <i className="ti ti-link" />
                  </Button>

                  <Button
                    onClick={() => handleDeleteInstance(instance.instance_name)}
                    variant="outline"
                    className="border-red-100 text-red-500 hover:bg-red-50 h-9 px-3"
                    title="Excluir Instância"
                  >
                    <i className="ti ti-trash" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: CRIAR INSTÂNCIA */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <i className="ti ti-brand-whatsapp text-emerald-500 text-xl" />
                Criar Nova Instância
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <form onSubmit={handleCreateInstance} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome da Instância
                </label>
                <Input
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  placeholder="Ex: BarberSuporte, Claudio..."
                  className="w-full rounded-xl border-slate-200"
                  required
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Use letras simples e números, sem caracteres especiais ou acentos.
                </span>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  variant="outline"
                  className="border-slate-200 text-slate-700 font-semibold"
                  disabled={createLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
                  disabled={createLoading}
                >
                  {createLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Criar Instância
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <i className="ti ti-qrcode text-slate-600" />
                Conectar: {selectedInstanceName}
              </h3>
              <button onClick={() => setQrModalOpen(false)} className="text-slate-400 hover:text-slate-650 transition">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Abra o WhatsApp no seu celular, toque em <span className="font-bold text-slate-700">Aparelhos Conectados</span> e escaneie o código abaixo.
              </p>

              {/* QR Container */}
              <div className="w-56 h-56 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative">
                {qrLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-400 font-semibold">Gerando código...</span>
                  </div>
                ) : qrCodeBase64 ? (
                  <img src={qrCodeBase64} alt="WhatsApp QR Code" className="w-full h-full p-2 select-none" />
                ) : (
                  <div className="text-xs text-red-500 p-4 font-semibold">Falha ao carregar QR Code</div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Aguardando leitura do celular...
              </div>

              <div className="w-full pt-4 border-t border-slate-100">
                <Button onClick={() => setQrModalOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Fechar Janela
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VINCULAR INSTÂNCIA */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <i className="ti ti-link text-indigo-500 text-xl" />
                Vincular Instância
              </h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <form onSubmit={handleLinkInstance} className="p-6 space-y-4">
              <p className="text-xs text-slate-550 leading-relaxed">
                Vincule a instância <span className="font-bold text-slate-800">"{linkInstanceName}"</span> a uma barbearia específica e/ou a um profissional dela. Deixe em branco para remover o vínculo.
              </p>

              {/* Select Barbearia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Barbearia (Cliente SaaS)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">-- Nenhuma barbearia vinculada --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Profissional */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Profissional / Colaborador
                </label>
                <select
                  value={selectedProfessionalId}
                  onChange={(e) => setSelectedProfessionalId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  disabled={!selectedClientId}
                >
                  <option value="">-- Nenhum colaborador (Vincular a nível de Barbearia) --</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ({p.role})
                    </option>
                  ))}
                </select>
                {!selectedClientId && (
                  <span className="text-[10px] text-slate-450 block italic mt-1">
                    Selecione uma barbearia primeiro para carregar os profissionais.
                  </span>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  variant="outline"
                  className="border-slate-200 text-slate-700 font-semibold"
                  disabled={linkLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                  disabled={linkLoading}
                >
                  {linkLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Salvar Vínculo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
