"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface Professional {
  id: string
  name: string
  bio?: string
  photo_url?: string
  status: string
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

interface ProfessionalServiceLink {
  professional_id: string
  service_id: string
  custom_price?: number
  custom_duration?: number
}

export default function ProfessionalDetailPage({ params }: { params: { id: string } }) {
  const professionalId = params.id

  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [links, setLinks] = useState<ProfessionalServiceLink[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Campos do formulário do Profissional
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("active")
  const [saving, setSaving] = useState(false)

  // Upload de Foto
  const [uploading, setUploading] = useState(false)

  // Dialog de Vínculo de Serviço
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customDuration, setCustomDuration] = useState("")
  const [linking, setLinking] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const resProf = await http.get<Professional>(`/professionals/${professionalId}`)
    const resServ = await http.get<Service[]>("/services")
    const resLinks = await http.get<ProfessionalServiceLink[]>(`/professionals/${professionalId}/services`)
    setLoading(false)

    if (resProf.error) {
      setErrorMsg(resProf.error.message)
      return
    }

    if (resProf.data) {
      setProfessional(resProf.data)
      setName(resProf.data.name)
      setBio(resProf.data.bio || "")
      setStatus(resProf.data.status)
    }

    if (resServ.data) setServices(resServ.data)
    if (resLinks.data) setLinks(resLinks.data)
  }

  useEffect(() => {
    loadData()
  }, [professionalId])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    setSaving(true)
    const res = await http.put<Professional>(`/professionals/${professionalId}`, {
      name,
      bio: bio ? bio : null,
      status,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setProfessional(res.data)
      alert("Perfil atualizado com sucesso!")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append("photo", file)

    const res = await http.post<{ photo_url: string }>(`/professionals/${professionalId}/photo`, formData)
    setUploading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data && professional) {
      setProfessional({ ...professional, photo_url: res.data.photo_url })
    }
  }

  const handleLinkService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceId) return

    setLinking(true)
    const res = await http.post(`/professionals/${professionalId}/services`, {
      service_id: selectedServiceId,
      custom_price: customPrice ? parseFloat(customPrice) : null,
      custom_duration: customDuration ? parseInt(customDuration) : null,
    })
    setLinking(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsLinkOpen(false)
    setSelectedServiceId("")
    setCustomPrice("")
    setCustomDuration("")
    loadData()
  }

  const handleUnlinkService = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja desvincular este serviço?")) return

    const res = await http.delete(`/professionals/${professionalId}/services/${serviceId}`)
    if (res.error) {
      alert(res.error.message)
      return
    }
    loadData()
  }

  if (loading && !professional) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!professional) return null

  // Filtra serviços que ainda não foram vinculados
  const unlinkedServices = services.filter((s) => !links.some((l) => l.service_id === s.id))

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <a href="/cliente/profissionais" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{professional.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configurar informações de equipe e portfólio.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Foto & Dados */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 shadow-sm relative group">
                {professional.photo_url ? (
                  <img src={professional.photo_url} alt={professional.name} className="h-full w-full object-cover" />
                ) : (
                  <i className="ti ti-user text-4xl" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <div>
                <label className="cursor-pointer">
                  <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]">
                    {uploading ? "Enviando..." : "Alterar Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-none">Formatos PNG, JPG até 5MB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Biografia</label>
                  <textarea
                    placeholder="Descrição profissional..."
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo (na agenda)</SelectItem>
                      <SelectItem value="inactive">Inativo (oculto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full font-semibold" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Serviços Vinculados */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Serviços Realizados</CardTitle>
                <CardDescription>Configure quais serviços este profissional atende e personalize preços/durações.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsLinkOpen(true)} className="flex items-center gap-1.5">
                <i className="ti ti-link text-base" />
                Vincular Serviço
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {links.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <i className="ti ti-cut text-4xl" />
                  <span className="text-sm font-semibold">Nenhum serviço vinculado a este profissional.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-4 pl-6">Serviço</th>
                        <th className="p-4">Preço Cadastrado</th>
                        <th className="p-4">Duração</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {links.map((link) => {
                        const originalSvc = services.find((s) => s.id === link.service_id)
                        if (!originalSvc) return null

                        const finalPrice = link.custom_price !== undefined && link.custom_price !== null ? link.custom_price : originalSvc.price
                        const finalDuration = link.custom_duration !== undefined && link.custom_duration !== null ? link.custom_duration : originalSvc.duration_minutes

                        return (
                          <tr key={link.service_id} className="hover:bg-slate-50/30">
                            <td className="p-4 pl-6">
                              <p className="font-bold text-slate-800">{originalSvc.name}</p>
                              {link.custom_price !== undefined && link.custom_price !== null && (
                                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded px-1.5 py-0.2">Preço customizado</span>
                              )}
                            </td>
                            <td className="p-4">
                              R$ {finalPrice.toFixed(2)}
                            </td>
                            <td className="p-4">
                              {finalDuration} min
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkService(link.service_id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Desvincular
                              </Button>
                            </td>
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
      </div>

      {/* Dialog Vincular Serviço */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Serviço ao Profissional</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkService} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Selecione o Serviço</label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (R$ {s.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Preço Customizado (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50.00 (Opcional)"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Duração Customizada (min)</label>
                <Input
                  type="number"
                  placeholder="Ex: 45 (Opcional)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLinkOpen(false)}
                disabled={linking}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={linking || !selectedServiceId}>
                {linking ? "Salvando..." : "Vincular Serviço"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
