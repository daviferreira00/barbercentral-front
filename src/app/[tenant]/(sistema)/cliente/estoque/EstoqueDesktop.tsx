"use client"

import { useEstoqueList } from "@/features/estoque/hooks/useEstoqueList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

export default function EstoqueDesktop() {
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

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Topo */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Controle de Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie a entrada, saída e auditoria de insumos e produtos da barbearia.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost" className="border border-slate-200 bg-white font-bold" onClick={handleExport}>
            <i className="ti ti-download mr-1.5" /> Exportar Relatório (CSV)
          </Button>
          <Button variant="ghost" className="border border-slate-200 bg-white font-bold" onClick={() => setMovementModalOpen(true)}>
            <i className="ti ti-arrows-left-right mr-1.5" /> Movimentar Estoque
          </Button>
          <Link href="/cliente/estoque/novo">
            <Button className="font-bold">
              <i className="ti ti-plus mr-1.5" /> Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="ti ti-alert-triangle text-base" /> Produtos com Estoque Baixo ou Crítico
          </span>
          <div className="flex gap-2 flex-wrap">
            {lowStockProducts.map((p) => (
              <span key={p.id} className="bg-white border border-amber-200/60 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700">
                {p.name}: <strong className="text-red-600 font-extrabold">{p.quantity_in_stock} {p.unit}</strong> (Mín: {p.low_stock_alert})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="w-[200px]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtro de Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Produtos</SelectItem>
              <SelectItem value="active">Apenas Ativos</SelectItem>
              <SelectItem value="low_stock">Estoque Baixo</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4 text-center">Unidade</th>
                  <th className="px-6 py-4 text-right">Preço Venda</th>
                  <th className="px-6 py-4 text-right">Preço Custo</th>
                  <th className="px-6 py-4 text-center">Estoque Atual</th>
                  <th className="px-6 py-4 text-center">Mínimo</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-lg w-12 mx-auto" /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold">
                      Nenhum produto cadastrado nesta barbearia.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLow = p.quantity_in_stock <= p.low_stock_alert
                    const isOut = p.quantity_in_stock <= 0

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-slate-500">
                          {p.sku || "-"}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div>{p.name}</div>
                          {p.active === 0 && <span className="text-[9px] text-red-500 uppercase font-bold bg-red-50 px-1 py-0.5 rounded border border-red-200/50">Inativo</span>}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">
                          {p.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          R$ {p.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-500">
                          R$ {p.cost_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black border ${
                            isOut
                              ? "bg-red-50 text-red-700 border-red-150"
                              : isLow
                              ? "bg-amber-50 text-amber-700 border-amber-150"
                              : "bg-emerald-50 text-emerald-700 border-emerald-150"
                          }`}>
                            {p.quantity_in_stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-500">
                          {p.low_stock_alert}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/cliente/estoque/${p.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 text-xs font-bold border border-slate-200 bg-white">
                              Gerenciar
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-semibold">
                Mostrando página {page} de {totalPages} ({total} produtos)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-slate-200 bg-white"
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border border-slate-200 bg-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: MOVIMENTAÇÃO DE ESTOQUE */}
      <Dialog open={movementModalOpen} onOpenChange={setMovementModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lançamento de Movimentação de Estoque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMovement} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Produto</label>
              <Select value={moveProductID} onValueChange={setMoveProductID}>
                <SelectTrigger className="text-xs font-semibold">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                <Select value={moveType} onValueChange={setMoveType}>
                  <SelectTrigger className="text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada (Reposição)</SelectItem>
                    <SelectItem value="out">Saída (Consumo/Descarte)</SelectItem>
                    <SelectItem value="adjustment">Ajuste de Inventário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  {moveType === "adjustment" ? "Nova Qtd Total" : "Quantidade"}
                </label>
                <Input
                  type="number"
                  step="0.001"
                  required
                  value={moveQty}
                  onChange={(e) => setMoveQty(e.target.value)}
                  placeholder="0.000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Justificativa / Motivo</label>
              <textarea
                required
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
                placeholder="Descreva o motivo da movimentação (ex: Recebimento do fornecedor X, quebra de frasco, contagem periódica...)"
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setMovementModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading || !moveProductID} className="font-bold">
                Confirmar Movimentação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
