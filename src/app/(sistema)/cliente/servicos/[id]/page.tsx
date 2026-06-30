"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface Service {
  id: string
  category_id?: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  active: number
}

interface ServiceCategory {
  id: string
  name: string
}

export default function ServicoDetailPage({ params }: { params: { id: string } }) {
  const serviceId = params.id
  const router = useRouter()

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30")
  const [price, setPrice] = useState("")
  const [active, setActive] = useState(1)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Insumos/Estoque
  const [serviceProducts, setServiceProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [linkQty, setLinkQty] = useState("1")
  const [linkError, setLinkError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const resSvc = await http.get<Service>(`/services/${serviceId}`)
    const resCat = await http.get<ServiceCategory[]>("/service-categories")
    const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
    const resProds = await http.get<{ data: any[] }>("/products?page=1&page_size=1000&filter=active")
    setLoading(false)

    if (resSvc.error) {
      setSaveError(resSvc.error.message)
      return
    }

    if (resSvc.data) {
      setService(resSvc.data)
      setName(resSvc.data.name)
      setCategoryId(resSvc.data.category_id || "")
      setDescription(resSvc.data.description || "")
      setDuration(resSvc.data.duration_minutes.toString())
      setPrice(resSvc.data.price.toString())
      setActive(resSvc.data.active)
    }

    if (resCat.data) setCategories(resCat.data)
    if (resSvcProds.data) setServiceProducts(resSvcProds.data)
    if (resProds.data) setAllProducts(resProds.data.data || [])
  }

  useEffect(() => {
    loadData()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name || !price || !duration) {
      setSaveError("Nome, preço e duração são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.put(`/services/${serviceId}`, {
      name,
      category_id: categoryId ? categoryId : null,
      description: description ? description : null,
      duration_minutes: parseInt(duration),
      price: parseFloat(price),
      active,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    alert("Serviço atualizado com sucesso!")
    router.push("/cliente/servicos")
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este serviço permanentemente?")) return

    setDeleting(true)
    const res = await http.delete(`/services/${serviceId}`)
    setDeleting(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    router.push("/cliente/servicos")
  }

  if (loading && !service) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!service) return null

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <a href="/cliente/servicos" className="text-slate-400 hover:text-slate-600 transition">
            <i className="ti ti-arrow-left text-xl" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Editar Serviço</h1>
            <p className="text-sm text-slate-500 mt-0.5">Editar configurações do serviço.</p>
          </div>
        </div>
        <Button variant="ghost" disabled={deleting} onClick={handleDelete} className="text-red-600 border border-red-200 hover:bg-red-50">
          <i className="ti ti-trash text-base mr-1.5" />
          Remover Serviço
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Serviço</label>
              <Input
                placeholder="Ex: Corte Degradê Navalhado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria (Opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Serviço</label>
              <textarea
                placeholder="Descreva o que está incluso no serviço..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Duração (minutos)</label>
                <Input
                  type="number"
                  placeholder="Ex: 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 45.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Status do Serviço</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="active"
                    checked={active === 1}
                    onChange={() => setActive(1)}
                    className="accent-primary h-4 w-4"
                    disabled={saving}
                  />
                  Ativo (Liberado para agendamento)
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="active"
                    checked={active === 0}
                    onChange={() => setActive(0)}
                    className="accent-primary h-4 w-4"
                    disabled={saving}
                  />
                  Pausado (Ocultado dos clientes)
                </label>
              </div>
            </div>

            {saveError && <Alert variant="error" message={saveError} />}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <a href="/cliente/servicos">
                <Button type="button" variant="ghost" disabled={saving}>
                  Cancelar
                </Button>
              </a>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CARD DE INSUMOS E CONSUMO DE ESTOQUE */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Consumo de Insumos (Estoque)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vincule os produtos do estoque que são consumidos quando este serviço for realizado para dar baixa automática.</p>
          </div>

          {/* Form para vincular produto */}
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!selectedProductId || !linkQty) return

            setSaving(true)
            setLinkError(null)
            const res = await http.post(`/services/${serviceId}/products`, {
              product_id: selectedProductId,
              quantity: parseFloat(linkQty) || 0,
            })
            setSaving(false)

            if (res.error) {
              setLinkError(res.error.message)
              return
            }

            setSelectedProductId("")
            setLinkQty("1")
            
            const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
            if (resSvcProds.data) setServiceProducts(resSvcProds.data)
          }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 border border-slate-100/60 p-4 rounded-xl">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Insumo / Produto</label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {allProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Qtd Consumida por Atendimento</label>
              <Input
                type="number"
                step="0.001"
                required
                value={linkQty}
                onChange={(e) => setLinkQty(e.target.value)}
                placeholder="1.000"
                className="bg-white"
              />
            </div>

            <Button type="submit" disabled={saving || !selectedProductId} className="font-bold">
              Vincular Insumo
            </Button>

            {linkError && <div className="text-xs text-red-500 font-semibold col-span-3">{linkError}</div>}
          </form>

          {/* Tabela de insumos vinculados */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Insumo</th>
                  <th className="px-4 py-2.5 text-center">Quantidade Consumida</th>
                  <th className="px-4 py-2.5 text-center">Unidade</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-xs text-slate-400 italic">
                      Nenhum insumo do estoque está vinculado a este serviço.
                    </td>
                  </tr>
                ) : (
                  serviceProducts.map((sp) => (
                    <tr key={sp.product_id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">{sp.product_name}</td>
                      <td className="px-4 py-3 text-center font-extrabold text-slate-700">{sp.quantity}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-400 uppercase">{sp.unit}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={saving}
                          onClick={async () => {
                            if (!confirm("Remover este insumo do serviço?")) return
                            setSaving(true)
                            const res = await http.delete(`/services/${serviceId}/products/${sp.product_id}`)
                            setSaving(false)
                            if (res.error) {
                              alert(res.error.message)
                              return
                            }
                            const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
                            if (resSvcProds.data) setServiceProducts(resSvcProds.data)
                          }}
                          className="h-8 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
