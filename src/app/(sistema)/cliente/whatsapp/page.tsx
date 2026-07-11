"use client"

import { useEffect, useState, useRef } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, Check } from "lucide-react"

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

interface Professional {
  id: string
  name: string
}

export default function ClientWhatsAppPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal: Conectar Aparelho
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [friendlyName, setFriendlyName] = useState("")
  const [selectedProfId, setSelectedProfId] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  // Modal: QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const loadInstances = async () => {
    setLoading(true)
    setError(null)
    const res = await http.get<WhatsAppInstance[]>("/cliente/whatsapp")
    if (res.error) {
      setError(res.error.message)
    } else if (res.data) {
      setInstances(Array.isArray(res.data) ? res.data : [])
    }
    setLoading(false)
  }

  const loadProfessionals = async () => {
    const res = await http.get<Professional[]>("/professionals?status=active")
    if (res.data) {
      setProfessionals(res.data)
    }
  }

  useEffect(() => {
    loadInstances()
    loadProfessionals()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Monitorar QR Code pareamento
  useEffect(() => {
    if (qrModalOpen && selectedInstanceName) {
      pollingRef.current = setInterval(async () => {
        const res = await http.get<any>(`/cliente/whatsapp/state/${encodeURIComponent(selectedInstanceName)}`)
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

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendlyName.trim()) return

    setCreateLoading(true)
    const res = await http.post<WhatsAppInstance>("/cliente/whatsapp", {
      professional_id: selectedProfId ? selectedProfId : null
    })
    setCreateLoading(false)

    if (res.error) {
      alert(res.error.message)
    } else if (res.data) {
      setCreateModalOpen(false)
      const createdName = res.data.instance_name
      setFriendlyName("")
      setSelectedProfId("")
      await loadInstances()
      handleShowQr(createdName)
    }
  }

  const handleShowQr = async (name: string) => {
    setSelectedInstanceName(name)
    setQrCodeBase64(null)
    setQrModalOpen(true)
    setQrLoading(true)

    const res = await http.get<any>(`/cliente/whatsapp/connect/${encodeURIComponent(name)}`)
    setQrLoading(false)

    if (res.error) {
      alert(res.error.message)
      setQrModalOpen(false)
    } else if (res.data) {
      const connData = res.data.data || res.data
      const state = connData.instance?.state || connData.state

      if (state === "open") {
        alert("Este WhatsApp já está conectado!")
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
    if (!confirm("Deseja realmente desconectar este celular do WhatsApp?")) return

    const res = await http.delete<{ ok: boolean }>(`/cliente/whatsapp/logout/${encodeURIComponent(name)}`)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadInstances()
    }
  }

  const handleDeleteInstance = async (name: string) => {
    if (!confirm("Deseja excluir permanentemente este canal de envio? Esta ação não pode ser desfeita.")) return

    const res = await http.delete<{ ok: boolean }>(`/cliente/whatsapp/${encodeURIComponent(name)}`)
    if (res.error) {
      alert(res.error.message)
    } else {
      loadInstances()
    }
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return "-"
    const clean = phone.split("@")[0]
    return `+${clean}`
  }

  return (
    <div className="space-y-6 w-full animate-fade-in px-1 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <i className="ti ti-brand-whatsapp text-emerald-500 text-3xl" />
            Canais de Envio (WhatsApp)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conecte celulares da barbearia ou dos barbeiros para disparar lembretes e agendamentos automaticamente.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <i className="ti ti-plus text-sm" />
          Conectar Celular
        </Button>
      </div>

      {error && <Alert variant="error" message={error} />}

      {/* Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-xs font-bold mt-2">Buscando canais conectados...</span>
        </div>
      ) : instances.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border">
            <i className="ti ti-brand-whatsapp text-slate-400 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum canal conectado</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Conecte o WhatsApp da sua barbearia para que o sistema possa disparar lembretes automáticos e mensagens de fidelização aos seus clientes.
          </p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            Conectar Novo WhatsApp
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((inst) => {
            const isConnected = inst.connection_status === "open"
            return (
              <Card key={inst.id} className="hover:border-slate-300 transition flex flex-col justify-between">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {inst.profile_pic_url ? (
                        <img
                          src={inst.profile_pic_url}
                          alt="Perfil"
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border">
                          <i className="ti ti-brand-whatsapp text-xl" />
                        </div>
                      )}
                      <div className="max-w-[140px] truncate">
                        <h3 className="font-bold text-slate-800 truncate" title={inst.professional_name || "Canal Geral"}>
                          {inst.professional_name ? inst.professional_name : "Canal Geral"}
                        </h3>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {inst.instance_name}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-750 border-red-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                      {isConnected ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telefone:</span>
                      <span className="font-bold text-slate-800">
                        {inst.number ? formatPhone(inst.number) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipo de Uso:</span>
                      <span className="font-bold text-slate-800">
                        {inst.professional_name ? (
                          <span className="text-indigo-600">Uso do Barbeiro</span>
                        ) : (
                          <span className="text-slate-600">Geral da Barbearia</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-2">
                    {isConnected ? (
                      <Button
                        onClick={() => handleLogoutInstance(inst.instance_name)}
                        variant="outline"
                        className="flex-1 text-xs border-slate-200 hover:bg-slate-50 text-slate-700 h-9 font-bold"
                      >
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleShowQr(inst.instance_name)}
                        className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-9 font-bold flex items-center justify-center gap-1.5"
                      >
                        <i className="ti ti-qrcode" />
                        Conectar Celular
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDeleteInstance(inst.instance_name)}
                      variant="outline"
                      className="border-red-100 text-red-500 hover:bg-red-50 h-9 px-3"
                      title="Excluir Conexão"
                    >
                      <i className="ti ti-trash text-sm" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODAL: PAREAMENTO NOVA CONEXÃO */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="ti ti-brand-whatsapp text-emerald-500 text-xl" />
                Conectar Novo Celular
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <form onSubmit={handleCreateInstance} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nome Amigável da Conexão
                </label>
                <Input
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  placeholder="Ex: Celular Principal, Telefone Recepção..."
                  className="w-full rounded-xl border-slate-200"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  A quem pertence este aparelho?
                </label>
                <SearchableSelect
                  value={selectedProfId}
                  onChange={setSelectedProfId}
                  placeholder="Geral da Barbearia (Padrão para todos)"
                  options={[
                    { value: "", label: "Geral da Barbearia (Padrão para todos)" },
                    ...professionals.map((p) => ({
                      value: p.id,
                      label: `Exclusivo do Barbeiro: ${p.name}`,
                    })),
                  ]}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Selecione um barbeiro se desejar que as notificações dos clientes dele saiam exclusivamente por esse celular.
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                  disabled={createLoading}
                >
                  {createLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Conectar Aparelho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE PAREAMENTO */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="ti ti-qrcode text-slate-600" />
                Escanear Código QR
              </h3>
              <button onClick={() => setQrModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Abra o WhatsApp no celular que deseja conectar, vá em <span className="font-bold text-slate-750">Aparelhos Conectados</span> e escaneie o código QR abaixo.
              </p>

              {/* QR Container */}
              <div className="w-56 h-56 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative">
                {qrLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-[10px] text-slate-450 font-semibold">Gerando código pareamento...</span>
                  </div>
                ) : qrCodeBase64 ? (
                  <img src={qrCodeBase64} alt="WhatsApp QR Code" className="w-full h-full p-2 select-none" />
                ) : (
                  <div className="text-xs text-red-500 p-4 font-semibold">Falha ao gerar pareamento. Recarregue.</div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Aguardando leitura do celular...
              </div>

              <div className="w-full pt-4 border-t border-slate-100">
                <Button onClick={() => setQrModalOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Fechar Janela
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder: string
  emptyMessage?: string
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyMessage = "Nenhum resultado encontrado."
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen)
          setSearch("")
        }}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition"
      >
        <span className={selectedOption ? "text-slate-800 font-medium" : "text-slate-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-fade-in max-h-60 overflow-y-auto">
          {/* Search Input */}
          <div className="relative mb-2 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-100 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-2 text-center text-xs text-slate-400 font-medium">{emptyMessage}</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition ${
                      isSelected
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-slate-850 stroke-[3px]" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
