"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"
import { useCaixaHistorico } from "@/features/caixa/hooks/useCaixaHistorico"
import { getMethodLabel } from "@/features/caixa/types"

export default function HistoricoDesktop() {
	const {
		registers,
		total,
		totalPages,
		page,
		setPage,
		loading,
		errorMsg,
		selectedReg,
		setSelectedReg,
		transactions,
		loadingTxs,
	} = useCaixaHistorico()

	return (
		<div className="space-y-6 w-full animate-fade-in">
			{/* Topo */}
			<div className="flex items-center gap-3">
				<Link href="/cliente/caixa">
					<Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
						<i className="ti ti-arrow-left text-sm mr-1" /> Voltar
					</Button>
				</Link>
				<div>
					<h1 className="text-xl font-bold text-slate-800">Histórico de Caixas</h1>
					<p className="text-xs text-slate-500 mt-0.5">Consulte os fechamentos anteriores e transações passadas.</p>
				</div>
			</div>

			{errorMsg && <Alert variant="error" message={errorMsg} />}

			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left text-slate-600">
							<thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
								<tr>
									<th className="px-6 py-4">Abertura</th>
									<th className="px-6 py-4">Fechamento</th>
									<th className="px-6 py-4 text-right">Saldo Inicial</th>
									<th className="px-6 py-4 text-right">Saldo Final</th>
									<th className="px-6 py-4">Status</th>
									<th className="px-6 py-4 text-center">Ações</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{loading ? (
									[1, 2, 3].map((i) => (
										<tr key={i} className="animate-pulse">
											<td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
											<td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
											<td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
											<td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
											<td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
											<td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-lg w-16 mx-auto" /></td>
										</tr>
									))
								) : registers.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
											Nenhum caixa registrado anteriormente.
										</td>
									</tr>
								) : (
									registers.map((reg) => (
										<tr key={reg.id} className="hover:bg-slate-50/50 transition">
											<td className="px-6 py-4 font-semibold text-slate-700">
												{new Date(reg.opened_at).toLocaleString("pt-BR")}
											</td>
											<td className="px-6 py-4 font-semibold text-slate-500">
												{reg.closed_at ? new Date(reg.closed_at).toLocaleString("pt-BR") : "Aberto"}
											</td>
											<td className="px-6 py-4 text-right font-extrabold text-slate-700">
												R$ {reg.opening_balance.toFixed(2)}
											</td>
											<td className="px-6 py-4 text-right font-extrabold text-slate-800">
												{reg.closing_balance !== undefined ? `R$ ${reg.closing_balance.toFixed(2)}` : "-"}
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border capitalize ${
													reg.status === "open"
														? "bg-indigo-50 text-indigo-700 border-indigo-100"
														: "bg-slate-100 text-slate-600 border-slate-200"
												}`}>
													{reg.status === "open" ? "Aberto" : "Fechado"}
												</span>
											</td>
											<td className="px-6 py-4 text-center">
												<Button
													size="sm"
													variant="ghost"
													onClick={() => setSelectedReg(reg)}
													className="h-8 text-xs font-bold border border-slate-200 bg-white"
												>
													Ver Detalhes
												</Button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Paginação */}
					{totalPages > 1 && (
						<div className="p-4 border-t border-slate-100 flex justify-between items-center">
							<span className="text-xs text-slate-400 font-semibold">
								Mostrando página {page} de {totalPages} ({total} caixas)
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

			{/* MODAL: DETALHES DO CAIXA FECHADO */}
			<Dialog open={selectedReg !== null} onOpenChange={(open) => !open && setSelectedReg(null)}>
				{selectedReg && (
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Resumo do Caixa ({selectedReg.status === "open" ? "Aberto" : "Fechado"})</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2 text-xs text-slate-700">
							<div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
								<div className="space-y-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">Abertura</span>
									<p className="font-bold text-slate-800">{new Date(selectedReg.opened_at).toLocaleString("pt-BR")}</p>
									<p className="text-[10px] text-slate-400">Saldo Inicial: R$ {selectedReg.opening_balance.toFixed(2)}</p>
								</div>
								<div className="space-y-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">Fechamento</span>
									<p className="font-bold text-slate-800">
										{selectedReg.closed_at ? new Date(selectedReg.closed_at).toLocaleString("pt-BR") : "Aberto"}
									</p>
									{selectedReg.closing_balance !== undefined && (
										<p className="text-[10px] text-slate-400">Saldo Fechamento: R$ {selectedReg.closing_balance.toFixed(2)}</p>
									)}
								</div>
							</div>

							{selectedReg.notes && (
								<div className="space-y-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">Observações</span>
									<p className="bg-slate-50 border border-slate-100 p-2 rounded text-slate-600 italic">
										{selectedReg.notes}
									</p>
								</div>
							)}

							<div className="space-y-2">
								<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lançamentos</span>
								{loadingTxs ? (
									<div className="text-center py-4">Carregando lançamentos...</div>
								) : transactions.length === 0 ? (
									<div className="text-center py-4 text-slate-400 italic">Nenhum lançamento neste caixa.</div>
								) : (
									<div className="overflow-x-auto border border-slate-100 rounded-xl max-h-60 overflow-y-auto">
										<table className="w-full text-left text-slate-600">
											<thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
												<tr>
													<th className="px-4 py-2">Data/Hora</th>
													<th className="px-4 py-2">Descrição</th>
													<th className="px-4 py-2">Método</th>
													<th className="px-4 py-2 text-right">Valor</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{transactions.map((tx) => (
													<tr key={tx.id}>
														<td className="px-4 py-2 text-slate-500">
															{new Date(tx.created_at).toLocaleString("pt-BR")}
														</td>
														<td className="px-4 py-2 font-semibold text-slate-800">{tx.description}</td>
														<td className="px-4 py-2 font-semibold text-slate-400">{getMethodLabel(tx.method)}</td>
														<td className={`px-4 py-2 text-right font-black ${
															tx.type === "income" ? "text-emerald-600" : "text-red-600"
														}`}>
															{tx.type === "income" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
						<DialogFooter className="pt-2 border-t border-slate-100">
							{selectedReg.status === "closed" && (
								<Button variant="ghost" className="border border-slate-200 bg-white" onClick={() => window.open(`/api/cash-registers/${selectedReg.id}/export`, "_blank")}>
									<i className="ti ti-download mr-1.5" /> Exportar Lançamentos (CSV)
								</Button>
							)}
							<Button type="button" onClick={() => setSelectedReg(null)}>
								Fechar
							</Button>
						</DialogFooter>
					</DialogContent>
				)}
			</Dialog>
		</div>
	)
}
