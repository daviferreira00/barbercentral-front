"use client"

import { useState } from "react"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { ListCard } from "@/components/mobile/ListCard"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { useServicoDetail } from "@/features/servicos/hooks/useServicoDetail"

export default function ServicoDetailMobile({ serviceId }: { serviceId: string }) {
  const {
    categories,
    service,
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
    deleting,
    saveError,
    serviceProducts,
    allProducts,
    selectedProductId,
    setSelectedProductId,
    linkQty,
    setLinkQty,
    linkError,
    handleSubmit,
    handleDelete,
    handleLinkProduct,
    handleUnlinkProduct,
  } = useServicoDetail(serviceId)

  const [isLinkOpen, setIsLinkOpen] = useState(false)

  if (loading && !service) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!service) return null

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    haptic()
    await handleLinkProduct(e)
    setIsLinkOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-28 animate-fade-in">
      {/* Header com Voltar e Deletar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cliente/servicos"
            aria-label="Voltar"
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
          >
            <i className="ti ti-arrow-left" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Editar Serviço</h1>
            <p className="text-xs font-semibold text-slate-400">Ajuste os dados do serviço.</p>
          </div>
        </div>
        <button
          aria-label="Excluir Serviço"
          disabled={deleting}
          onClick={() => {
            haptic()
            handleDelete()
          }}
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition active:scale-90 disabled:opacity-50"
        >
          <i className="ti ti-trash text-lg" />
        </button>
      </div>

      {/* Seção 1: Formulário Principal */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-800 border-b pb-2">Informações Gerais</h2>
          
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Nome do Serviço
            </label>
            <Input
              placeholder="Ex: Corte Degradê Navalhado"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Categoria
            </label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
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
              disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
                className="h-11 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Status do Serviço
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
          </div>

          {saveError && <Alert variant="error" message={saveError} />}
        </div>

        {/* ActionBar Fixo de Submit */}
        <ActionBar>
          <button
            type="submit"
            disabled={saving}
            className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </ActionBar>
      </form>

      {/* Seção 2: Insumos (Consumo de Estoque) */}
      <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Consumo de Insumos</h2>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Baixa automática no estoque ao agendar.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              haptic()
              setIsLinkOpen(true)
            }}
            className="mobile-tap flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition active:scale-95"
          >
            <i className="ti ti-plus" />
            <span>Vincular</span>
          </button>
        </div>

        {serviceProducts.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400 italic">
            Nenhum insumo do estoque está vinculado a este serviço.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {serviceProducts.map((sp, idx) => (
              <ListCard
                key={sp.product_id}
                index={idx}
                title={sp.product_name}
                subtitle={`Quantidade consumida: ${sp.quantity} ${sp.unit}`}
                footerRight={
                  <button
                    type="button"
                    onClick={() => {
                      haptic()
                      handleUnlinkProduct(sp.product_id)
                    }}
                    className="mobile-tap text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1"
                  >
                    Remover
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet para Vincular Insumo */}
      <BottomSheet
        open={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        title="Vincular Insumo ao Serviço"
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Insumo / Produto
            </label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="h-11 rounded-xl w-full text-base">
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

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Quantidade Consumida por Atendimento
            </label>
            <Input
              type="number"
              step="0.001"
              required
              value={linkQty}
              onChange={(e) => setLinkQty(e.target.value)}
              placeholder="1.000"
              className="h-11 rounded-xl text-base"
            />
          </div>

          {linkError && <div className="text-xs text-red-500 font-semibold">{linkError}</div>}

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                haptic()
                setIsLinkOpen(false)
              }}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !selectedProductId}
              className="flex-1 h-11 rounded-xl font-bold text-white shadow-md"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Vincular Insumo
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
