"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { useNovoServico } from "@/features/servicos/hooks/useNovoServico"

export default function NovoServicoMobile() {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/cliente/servicos"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Novo Serviço</h1>
          <p className="text-xs font-semibold text-slate-400">Criar uma nova opção de serviço.</p>
        </div>
      </div>

      <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Nome do Serviço
          </label>
          <Input
            placeholder="Ex: Corte Degradê Navalhado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={saving || loading}
            className="h-11 rounded-xl text-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Categoria
          </label>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={saving || loading}>
            <SelectTrigger className="h-11 rounded-xl w-full text-base">
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

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Descrição do Serviço
          </label>
          <textarea
            placeholder="Descreva o que está incluso no serviço..."
            className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving || loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Duração (minutos)
            </label>
            <Input
              type="number"
              placeholder="Ex: 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              disabled={saving || loading}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Preço (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 45.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={saving || loading}
              className="h-11 rounded-xl text-base"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Status inicial
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                haptic()
                setActive(1)
              }}
              className={`mobile-tap rounded-xl border py-3 text-xs font-extrabold transition active:scale-95 ${
                active === 1 ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white text-slate-600"
              }`}
              style={active === 1 ? { backgroundColor: "var(--color-primary)" } : {}}
            >
              <i className="ti ti-check mr-1" />
              Ativo
            </button>
            <button
              type="button"
              onClick={() => {
                haptic()
                setActive(0)
              }}
              className={`mobile-tap rounded-xl border py-3 text-xs font-extrabold transition active:scale-95 ${
                active === 0 ? "border-transparent bg-slate-700 text-white shadow-md" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <i className="ti ti-eye-off mr-1" />
              Pausado
            </button>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
            Ativo fica disponível para agendamento online; pausado fica oculto.
          </p>
        </div>

        {saveError && <Alert variant="error" message={saveError} />}
      </div>

      <ActionBar>
        <button
          type="submit"
          disabled={saving || loading}
          className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {saving ? "Criando..." : "Criar Serviço"}
        </button>
      </ActionBar>
    </form>
  )
}
