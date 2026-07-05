"use client"

import { useProdutoDetail } from "@/features/estoque/hooks/useProdutoDetail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

export default function ProdutoDetailDesktop({ productId }: { productId: string }) {
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

  const getMovementTypeLabel = (t: string) => {
    switch (t) {
      case "in": return "Entrada (+)"
      case "out": return "Saída (-)"
      case "adjustment": return "Ajuste"
      default: return t
    }
  }

  if (loading && !product) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full animate-fade-in px-1 md:px-0">
      {/* Topo com retorno */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/cliente/estoque">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
              <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{product?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">SKU: {product?.sku || "-"}</p>
          </div>
        </div>

        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/40 bg-white text-xs font-bold" onClick={handleDelete} disabled={deleting}>
          <i className="ti ti-trash mr-1.5" /> Inativar Produto
        </Button>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

      {/* Cards de Métricas */}
      {product && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estoque Atual</span>
                <span className={`text-2xl font-black mt-1 block ${
                  product.quantity_in_stock <= 0
                    ? "text-red-600"
                    : product.quantity_in_stock <= product.low_stock_alert
                    ? "text-amber-600"
                    : "text-slate-800"
                }`}>
                  {product.quantity_in_stock} {product.unit}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-600 border border-slate-100 flex items-center justify-center text-lg">
                <i className="ti ti-archive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preço de Venda</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">R$ {product.price.toFixed(2)}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg">
                <i className="ti ti-cash" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alerta Nível Mínimo</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{product.low_stock_alert} {product.unit}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-lg">
                <i className="ti ti-alert-triangle" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="w-full">
        <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 max-w-[480px] mb-4">
          <button
            onClick={() => setActiveTab("cadastro")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "cadastro"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Cadastro
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "movements"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Movimentações ({movements.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "services"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Serviços Vinculados ({linkedServices.length})
          </button>
        </div>

        {/* TAB 1: CADASTRO */}
        {activeTab === "cadastro" && (
          <Card>
            <CardHeader>
              <CardTitle>Editar Produto</CardTitle>
              <CardDescription>Ajuste as informações básicas de precificação e dados cadastrais.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">SKU</label>
                    <Input value={sku} onChange={(e) => setSku(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Alerta Mínimo</label>
                    <Input value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5 col-span-3 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <Select value={active.toString()} onValueChange={(val) => setActive(parseInt(val))}>
                      <SelectTrigger className="text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ativo</SelectItem>
                        <SelectItem value="0">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Preço Venda (R$)</label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Preço Custo (R$)</label>
                    <Input value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow duration-100"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                  <Button type="submit" disabled={saving} className="font-bold">
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: MOVIMENTAÇÕES */}
        {activeTab === "movements" && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações de Estoque</CardTitle>
              <CardDescription>Veja o log completo de auditoria para as entradas, saídas e ajustes deste produto.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {movements.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-semibold">Nenhuma movimentação registrada.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Data/Hora</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4 text-center">Quantidade</th>
                        <th className="px-6 py-4">Motivo / Justificativa</th>
                        <th className="px-6 py-4">Origem</th>
                        <th className="px-6 py-4">Registrado por</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-medium text-slate-500">
                            {new Date(m.created_at).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 font-bold capitalize text-slate-700">
                            {getMovementTypeLabel(m.type)}
                          </td>
                          <td className={`px-6 py-4 text-center font-black ${
                            m.type === "in" ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {m.type === "in" ? "+" : "-"} {m.quantity}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-semibold max-w-xs truncate">
                            {m.reason || "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-bold">
                            {m.appointment_id ? (
                              <span className="text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-600">
                                Agendamento {m.appointment_id.substring(0, 8)}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-indigo-600">Manual</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px]">
                            {m.created_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: SERVIÇOS VINCULADOS */}
        {activeTab === "services" && (
          <Card>
            <CardHeader className="flex justify-between items-center flex-wrap gap-2 py-4 border-b border-slate-100">
              <div>
                <CardTitle>Baixa Automática de Insumos</CardTitle>
                <CardDescription>Configure quais serviços consomem este produto no atendimento para dar baixa automática.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setLinkModalOpen(true)} className="font-bold">
                <i className="ti ti-link mr-1.5" /> Vincular Serviço
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {linkedServices.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-semibold">Nenhum serviço configurado para consumir este produto.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Serviço</th>
                        <th className="px-6 py-4 text-center">Consumo por Atendimento</th>
                        <th className="px-6 py-4 text-center">Unidade</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linkedServices.map((ls) => (
                        <tr key={ls.service_id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {ls.product_name}
                          </td>
                          <td className="px-6 py-4 text-center font-extrabold text-slate-700">
                            {ls.quantity}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-400">
                            {ls.unit}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={saving}
                              onClick={() => handleUnlinkService(ls.service_id)}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                            >
                              Remover Vínculo
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* MODAL: VINCULAR SERVIÇO */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Produto a Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkService} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Serviço</label>
              <Select value={selectedServiceID} onValueChange={setSelectedServiceID}>
                <SelectTrigger className="text-xs font-semibold">
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade Consumida por Atendimento</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  step="0.001"
                  required
                  value={linkQty}
                  onChange={(e) => setLinkQty(e.target.value)}
                  placeholder="1.000"
                />
                <span className="font-bold text-sm text-slate-500 uppercase">{product?.unit}</span>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setLinkModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || !selectedServiceID} className="font-bold">
                Salvar Vínculo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
