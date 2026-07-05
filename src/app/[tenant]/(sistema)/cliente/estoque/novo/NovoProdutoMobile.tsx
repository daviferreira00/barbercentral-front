"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { useNovoProduto } from "@/features/estoque/hooks/useNovoProduto"

export default function NovoProdutoMobile() {
  const {
    name,
    setName,
    sku,
    setSku,
    description,
    setDescription,
    price,
    setPrice,
    costPrice,
    setCostPrice,
    quantityInStock,
    setQuantityInStock,
    lowStockAlert,
    setLowStockAlert,
    unit,
    setUnit,
    submitting,
    errorMsg,
    handleSubmit,
  } = useNovoProduto()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/cliente/estoque"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Novo Produto</h1>
          <p className="text-xs font-semibold text-slate-400">Cadastre um novo item no estoque.</p>
        </div>
      </div>

      <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Nome do Produto
          </label>
          <Input
            placeholder="Ex: Cera modeladora Efeito Seco"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            className="h-11 rounded-xl text-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            SKU / Código do Produto
          </label>
          <Input
            placeholder="Ex: CERA-MATTE-01"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={submitting}
            className="h-11 rounded-xl text-base"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Unidade
            </label>
            <Input
              placeholder="Ex: un"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              disabled={submitting}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Estoque Inicial
            </label>
            <Input
              type="number"
              step="0.001"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(e.target.value)}
              placeholder="0.000"
              disabled={submitting}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Alerta Mínimo
            </label>
            <Input
              type="number"
              step="0.001"
              value={lowStockAlert}
              onChange={(e) => setLowStockAlert(e.target.value)}
              placeholder="5.000"
              disabled={submitting}
              className="h-11 rounded-xl text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Preço de Venda (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Preço de Custo (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              className="h-11 rounded-xl text-base"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Descrição do Produto (Opcional)
          </label>
          <textarea
            placeholder="Descreva a finalidade ou observações do produto..."
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}
      </div>

      <ActionBar>
        <button
          type="submit"
          disabled={submitting}
          className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {submitting ? "Cadastrando..." : "Cadastrar Produto"}
        </button>
      </ActionBar>
    </form>
  )
}
