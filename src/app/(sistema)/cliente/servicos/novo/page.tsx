"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface ServiceCategory {
  id: string
  name: string
}

export default function NovoServicoPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30")
  const [price, setPrice] = useState("")
  const [active, setActive] = useState(1)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      const res = await http.get<ServiceCategory[]>("/service-categories")
      setLoading(false)
      if (res.data) setCategories(res.data)
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name || !price || !duration) {
      setSaveError("Nome, preço e duração são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.post("/services", {
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

    router.push("/cliente/servicos")
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2">
        <a href="/cliente/servicos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Serviço</h1>
          <p className="text-sm text-slate-500 mt-0.5">Criar uma nova opção de serviço para agendamento.</p>
        </div>
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
                disabled={saving || loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={saving || loading}>
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
                disabled={saving || loading}
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
                  disabled={saving || loading}
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
                  disabled={saving || loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Status Inicial</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="active"
                    checked={active === 1}
                    onChange={() => setActive(1)}
                    className="accent-primary h-4 w-4"
                    disabled={saving || loading}
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
                    disabled={saving || loading}
                  />
                  Pausado (Ocultado dos clientes)
                </label>
              </div>
            </div>

            {saveError && <Alert variant="error" message={saveError} />}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <a href="/cliente/servicos">
                <Button type="button" variant="ghost" disabled={saving || loading}>
                  Cancelar
                </Button>
              </a>
              <Button type="submit" disabled={saving || loading}>
                {saving ? "Salvando..." : "Criar Serviço"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
