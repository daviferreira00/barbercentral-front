"use client"

import { useNovoServico } from "@/features/servicos/hooks/useNovoServico"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function NovoServicoDesktop() {
  const {
    categories,
    loading,
    name,
    setName,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    duration,
    setDuration,
    price,
    setPrice,
    active,
    setActive,
    saving,
    saveError,
    handleSubmit,
  } = useNovoServico()

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in px-1 md:px-0">
      <div className="flex items-center gap-2">
        <a href="/cliente/servicos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Novo Serviço</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Criar uma nova opção de serviço para agendamento.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 px-4 pb-4 md:px-6 md:pb-6">
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

            <div className="grid grid-cols-2 gap-3 md:gap-4">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
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
                <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
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

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 w-full md:flex md:justify-end md:w-auto">
              <a href="/cliente/servicos" className="w-full md:w-auto">
                <Button type="button" variant="ghost" disabled={saving || loading} className="w-full h-9 text-xs">
                  Cancelar
                </Button>
              </a>
              <Button type="submit" disabled={saving || loading} className="w-full h-9 text-xs">
                {saving ? "Salvando..." : "Criar Serviço"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
