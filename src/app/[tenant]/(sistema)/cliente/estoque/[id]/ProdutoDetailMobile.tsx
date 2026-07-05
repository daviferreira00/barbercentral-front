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
import { useProdutoDetail } from "@/features/estoque/hooks/useProdutoDetail"

export default function ProdutoDetailMobile({ productId }: { productId: string }) {
  const {
    product,
    movements,
    linkedServices,
    allServices,
    loading,
    saving,
    deleting,
    errorMsg,
    successMsg,
    activeTab,
    setActiveTab,
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
    lowStockAlert,
    setLowStockAlert,
    unit,
    setUnit,
    active,
    setActive,
    linkModalOpen,
    setLinkModalOpen,
    selectedServiceID,
    setSelectedServiceID,
    linkQty,
    setLinkQty,
    handleUpdate,
    handleDelete,
    handleLinkService,
    handleUnlinkService,
  } = useProdutoDetail(productId)

  const [isLinkOpen, setIsLinkOpen] = useState(false)

  if (loading && !product) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) return null

  const getMovementTypeLabel = (t: string) => {
    switch (t) {
      case "in": return "Entrada (+)"
      case "out": return "Saída (-)"
      case "adjustment": return "Ajuste"
      default: return t
    }
  }

  const getMovementTypeTone = (t: string) => {
    switch (t) {
      case "in": return "success"
      case "out": return "danger"
      default: return "warning"
    }
  }

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    haptic()
    await handleLinkService(e)
    setIsLinkOpen(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-28 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cliente/estoque"
            aria-label="Voltar"
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
          >
            <i className="ti ti-arrow-left" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">{product.name}</h1>
            <p className="text-xs font-semibold text-slate-400">SKU: {product.sku || "-"}</p>
          </div>
        </div>
        <button
          aria-label="Inativar Produto"
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

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

      {/* Grid de Estatísticas Rápidas */}
      <div className="grid grid-cols-3 gap-2.5 animate-card-enter">
        <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm flex flex-col justify-center">
          <p className={`text-base font-extrabold block truncate leading-none ${
            product.quantity_in_stock <= 0
              ? "text-red-500"
              : product.quantity_in_stock <= product.low_stock_alert
              ? "text-amber-500"
              : "text-slate-800"
          }`}>
            {product.quantity_in_stock}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 leading-none">Estoque ({product.unit})</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm flex flex-col justify-center">
          <p className="text-base font-extrabold text-slate-800 block truncate leading-none">
            R$ {product.price.toFixed(2)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 leading-none">Venda</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm flex flex-col justify-center">
          <p className="text-base font-extrabold text-slate-800 block truncate leading-none">
            {product.low_stock_alert}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 leading-none">Mínimo</p>
        </div>
      </div>

      {/* Navegação por Abas (Tabs) */}
      <div className="flex border border-slate-150 p-1 rounded-xl bg-slate-100 w-full shadow-inner">
        <button
          onClick={() => {
            haptic()
            setActiveTab("cadastro")
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "cadastro"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Cadastro
        </button>
        <button
          onClick={() => {
            haptic()
            setActiveTab("movements")
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "movements"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Histórico ({movements.length})
        </button>
        <button
          onClick={() => {
            haptic()
            setActiveTab("services")
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "services"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Serviços ({linkedServices.length})
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* TAB 1: FORMULÁRIO DE CADASTRO */}
      {activeTab === "cadastro" && (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Nome do Produto
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
                className="h-11 rounded-xl text-base"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                SKU
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={saving}
                className="h-11 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Unidade
                </label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  disabled={saving}
                  className="h-11 rounded-xl text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Alerta Mínimo
                </label>
                <Input
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.value)}
                  required
                  disabled={saving}
                  className="h-11 rounded-xl text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <Select value={active.toString()} onValueChange={(val) => setActive(parseInt(val))}>
                  <SelectTrigger className="h-11 rounded-xl text-base w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ativo</SelectItem>
                    <SelectItem value="0">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Preço Venda (R$)
                </label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={saving}
                  className="h-11 rounded-xl text-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Preço Custo (R$)
                </label>
                <Input
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  disabled={saving}
                  className="h-11 rounded-xl text-base"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
              />
            </div>
          </div>

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
      )}

      {/* TAB 2: HISTÓRICO DE MOVIMENTAÇÕES */}
      {activeTab === "movements" && (
        <div className="flex flex-col gap-3">
          {movements.length === 0 ? (
            <EmptyState
              icon="ti-arrows-left-right"
              title="Sem movimentações"
              description="Nenhuma entrada ou saída registrada para este produto."
            />
          ) : (
            movements.map((m, idx) => (
              <ListCard
                key={m.id}
                index={idx}
                title={getMovementTypeLabel(m.type)}
                subtitle={
                  <span className="flex flex-col gap-0.5 text-slate-500">
                    <span className="font-semibold text-xs leading-relaxed">{m.reason || "Ajuste manual de estoque"}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                      Registrado por: {m.created_by}
                    </span>
                  </span>
                }
                pill={{
                  label: `${m.type === "in" ? "+" : m.type === "out" ? "-" : ""} ${m.quantity} ${product.unit}`,
                  tone: getMovementTypeTone(m.type),
                }}
                footerLeft={
                  <span className="text-slate-400">
                    <i className="ti ti-calendar-time mr-1 text-[11px]" />
                    {new Date(m.created_at).toLocaleString("pt-BR")}
                  </span>
                }
                footerRight={
                  m.appointment_id ? (
                    <span className="text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-500 font-bold">
                      Agendamento
                    </span>
                  ) : (
                    <span className="text-[10px] bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded text-indigo-500 font-bold">
                      Manual
                    </span>
                  )
                }
              />
            ))
          )}
        </div>
      )}

      {/* TAB 3: SERVIÇOS VINCULADOS */}
      {activeTab === "services" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Baixa Automática</h2>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Serviços que consomem este insumo.</p>
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

          {linkedServices.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400 italic">
              Nenhum serviço está configurado para consumir este produto.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedServices.map((ls, idx) => (
                <ListCard
                  key={ls.service_id}
                  index={idx}
                  title={ls.product_name}
                  subtitle={`Quantidade consumida: ${ls.quantity} ${ls.unit}`}
                  footerRight={
                    <button
                      type="button"
                      onClick={() => {
                        haptic()
                        handleUnlinkService(ls.service_id)
                      }}
                      className="mobile-tap text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1"
                    >
                      Desvincular
                    </button>
                  }
                />
              ))}
            </div>
          )}

          {/* Bottom Sheet de Vínculo de Serviço */}
          <BottomSheet
            open={isLinkOpen}
            onClose={() => setIsLinkOpen(false)}
            title="Vincular Produto a Serviço"
          >
            <form onSubmit={handleLinkSubmit} className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Selecionar Serviço
                </label>
                <Select value={selectedServiceID} onValueChange={setSelectedServiceID}>
                  <SelectTrigger className="h-11 rounded-xl w-full text-base">
                    <SelectValue placeholder="Escolha um serviço..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Quantidade Consumida por Atendimento
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.001"
                    required
                    value={linkQty}
                    onChange={(e) => setLinkQty(e.target.value)}
                    placeholder="1.000"
                    className="h-11 rounded-xl text-base flex-1"
                  />
                  <span className="font-extrabold text-sm text-slate-400 uppercase">{product.unit}</span>
                </div>
              </div>

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
                  disabled={saving || !selectedServiceID}
                  className="flex-1 h-11 rounded-xl font-bold text-white shadow-md"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Salvar Vínculo
                </Button>
              </div>
            </form>
          </BottomSheet>
        </div>
      )}
    </div>
  )
}
