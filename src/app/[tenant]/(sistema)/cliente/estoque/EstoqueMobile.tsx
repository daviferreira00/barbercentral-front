"use client"

import { useState } from "react"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { FilterChips } from "@/components/mobile/FilterChips"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { Button } from "@/components/ui/button"
import { haptic } from "@/shared/lib/haptics"
import { useEstoqueList } from "@/features/estoque/hooks/useEstoqueList"

export default function EstoqueMobile() {
  const {
    products,
    allProducts,
    lowStockProducts,
    total,
    query,
    setQuery,
    filter,
    setFilter,
    page,
    setPage,
    loading,
    actionLoading,
    errorMsg,
    movementModalOpen,
    setMovementModalOpen,
    moveProductID,
    setMoveProductID,
    moveType,
    setMoveType,
    moveQty,
    setMoveQty,
    moveReason,
    setMoveReason,
    handleCreateMovement,
    handleExport,
    totalPages,
  } = useEstoqueList()

  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "low_stock", label: "Estoque Baixo" },
    { value: "inactive", label: "Inativos" },
  ]

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    haptic()
    await handleCreateMovement(e)
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Estoque</h1>
          <p className="text-xs font-semibold text-slate-400">
            {loading ? "Carregando..." : `${total} produto${total === 1 ? "" : "s"} no total`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Exportar CSV"
            onClick={() => {
              haptic()
              handleExport()
            }}
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-95 shadow-sm"
          >
            <i className="ti ti-download" />
          </button>
          <button
            onClick={() => {
              haptic()
              setMovementModalOpen(true)
            }}
            className="mobile-tap flex h-10 px-3 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
          >
            <i className="ti ti-arrows-left-right" />
            <span>Movimentar</span>
          </button>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Alerta de Estoque Crítico */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="ti ti-alert-triangle text-base text-amber-600" /> Alerta de Reposição ({lowStockProducts.length})
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {lowStockProducts.map((p) => (
              <span
                key={p.id}
                className="shrink-0 bg-white border border-amber-200/60 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-600"
              >
                {p.name}: <strong className="text-red-500">{p.quantity_in_stock} {p.unit}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Busca sempre visível */}
      <div className="relative">
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-xl bg-white pl-10 text-base"
        />
        <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Chips de filtro */}
      <FilterChips
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />

      {/* Listagem */}
      {loading ? (
        <SkeletonList count={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="ti-box"
          title="Nenhum produto cadastrado"
          description="Cadastre seu primeiro produto no botão + abaixo."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p, i) => {
            const isLow = p.quantity_in_stock <= p.low_stock_alert
            const isOut = p.quantity_in_stock <= 0

            return (
              <ListCard
                key={p.id}
                index={i}
                title={p.name}
                subtitle={
                  <span className="font-mono text-[10px] text-slate-400">
                    {p.sku ? `SKU: ${p.sku}` : "Sem SKU"}
                  </span>
                }
                pill={
                  isOut
                    ? { label: "Esgotado", tone: "danger" }
                    : isLow
                    ? { label: "Baixo", tone: "warning" }
                    : { label: "Normal", tone: "success" }
                }
                footerLeft={
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400">Venda / Custo</span>
                    <span>R$ {p.price.toFixed(2)} / R$ {p.cost_price.toFixed(2)}</span>
                  </span>
                }
                footerRight={
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-slate-400">Estoque Atual</span>
                    <span>{p.quantity_in_stock} {p.unit}</span>
                  </span>
                }
                onClick={() => {
                  haptic()
                  window.location.href = `/cliente/estoque/${p.id}`
                }}
              />
            )
          })}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <button
            disabled={page === 1}
            onClick={() => {
              haptic()
              setPage(page - 1)
            }}
            className="mobile-tap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition active:scale-95 disabled:opacity-40"
          >
            <i className="ti ti-chevron-left mr-1" />
            Anterior
          </button>
          <span className="text-[11px] font-bold text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => {
              haptic()
              setPage(page + 1)
            }}
            className="mobile-tap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition active:scale-95 disabled:opacity-40"
          >
            Próxima
            <i className="ti ti-chevron-right ml-1" />
          </button>
        </div>
      )}

      {/* Bottom Sheet de Movimentação */}
      <BottomSheet
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        title="Lançamento de Estoque"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Selecionar Produto
            </label>
            <Select value={moveProductID} onValueChange={setMoveProductID}>
              <SelectTrigger className="h-11 rounded-xl w-full text-base">
                <SelectValue placeholder="Escolha um produto..." />
              </SelectTrigger>
              <SelectContent>
                {allProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.sku && `(SKU: ${p.sku})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Tipo
              </label>
              <Select value={moveType} onValueChange={setMoveType}>
                <SelectTrigger className="h-11 rounded-xl w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Entrada (Reposição)</SelectItem>
                  <SelectItem value="out">Saída (Consumo)</SelectItem>
                  <SelectItem value="adjustment">Ajuste Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {moveType === "adjustment" ? "Nova Qtd Total" : "Quantidade"}
              </label>
              <Input
                type="number"
                step="0.001"
                required
                value={moveQty}
                onChange={(e) => setMoveQty(e.target.value)}
                placeholder="0.000"
                className="h-11 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Justificativa / Motivo
            </label>
            <textarea
              required
              value={moveReason}
              onChange={(e) => setMoveReason(e.target.value)}
              placeholder="Ex: Recebimento do fornecedor X, quebra de frasco, contagem periódica..."
              className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                haptic()
                setMovementModalOpen(false)
              }}
              disabled={actionLoading}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={actionLoading || !moveProductID}
              className="flex-1 h-11 rounded-xl font-bold text-white shadow-md"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* FAB para cadastrar produto */}
      <Fab icon="ti-plus" href="/cliente/estoque/novo" ariaLabel="Novo produto" />
    </div>
  )
}
