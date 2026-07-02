"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

interface CashRegister {
	id: string
	opened_by: string
	opened_at: string
	opening_balance: number
	status: string // open, closed
}

interface CashTransaction {
	id: string
	register_id: string
	appointment_payment_id?: string
	type: string // income, expense
	amount: number
	method: string // cash, pix, card_debit, card_credit, other
	description: string
	category?: string
	created_at: string
}

interface SummaryResponse {
	register: CashRegister
	total_income: number
	total_expense: number
	expected_balance: number
	method_totals: Record<string, number>
}

export default function CaixaPage() {
	// Active data
	const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null)
	const [summary, setSummary] = useState<SummaryResponse | null>(null)
	const [transactions, setTransactions] = useState<CashTransaction[]>([])

	// Loaders & Errors
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	// Modal controls
	const [openModalOpen, setOpenModalOpen] = useState(false)
	const [closeModalOpen, setCloseModalOpen] = useState(false)
	const [txModalOpen, setTxModalOpen] = useState(false)

	// Modal form inputs
	const [openingBalance, setOpeningBalance] = useState("0")
	const [openNotes, setOpenNotes] = useState("")

	const [closingBalance, setClosingBalance] = useState("0")
	const [closeNotes, setCloseNotes] = useState("")

	const [txType, setTxType] = useState("income")
	const [txAmount, setTxAmount] = useState("")
	const [txMethod, setTxMethod] = useState("cash")
	const [txDescription, setTxDescription] = useState("")
	const [txCategory, setTxCategory] = useState("")

	const loadCaixa = async () => {
		setLoading(true)
		setErrorMsg(null)

		// 1. Busca caixa atual aberto
		const resCurrent = await http.get<CashRegister | null>("/cash-registers/current")
		if (resCurrent.error) {
			setErrorMsg(resCurrent.error.message)
			setLoading(false)
			return
		}

		const reg = resCurrent.data
		setActiveRegister(reg ?? null)

		if (reg) {
			// 2. Busca resumo e transações
			const resSum = await http.get<SummaryResponse>(`/cash-registers/${reg.id}/summary`)
			const resTxs = await http.get<CashTransaction[]>(`/cash-registers/${reg.id}/transactions`)

			if (resSum.data) setSummary(resSum.data)
			if (resTxs.data) setTransactions(resTxs.data)
		} else {
			setSummary(null)
			setTransactions([])
		}

		setLoading(false)
	}

	useEffect(() => {
		loadCaixa()
	}, [])

	// Ações do caixa
	const handleOpenCaixa = async (e: React.FormEvent) => {
		e.preventDefault()
		setActionLoading(true)
		setErrorMsg(null)

		const res = await http.post<CashRegister>("/cash-registers/open", {
			opening_balance: parseFloat(openingBalance) || 0,
			notes: openNotes ? openNotes : null,
		})
		setActionLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		setOpenModalOpen(false)
		setOpeningBalance("0")
		setOpenNotes("")
		loadCaixa()
	}

	const handleCloseCaixa = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activeRegister) return

		setActionLoading(true)
		setErrorMsg(null)

		const res = await http.post(`/cash-registers/${activeRegister.id}/close`, {
			closing_balance: parseFloat(closingBalance) || 0,
			notes: closeNotes ? closeNotes : null,
		})
		setActionLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		setCloseModalOpen(false)
		setClosingBalance("0")
		setCloseNotes("")
		loadCaixa()
	}

	const handleCreateTransaction = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activeRegister || !txAmount || !txDescription) return

		setActionLoading(true)
		setErrorMsg(null)

		const res = await http.post(`/cash-registers/${activeRegister.id}/transactions`, {
			type: txType,
			amount: parseFloat(txAmount) || 0,
			method: txMethod,
			description: txDescription,
			category: txCategory ? txCategory : null,
		})
		setActionLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		setTxModalOpen(false)
		setTxAmount("")
		setTxDescription("")
		setTxCategory("")
		loadCaixa()
	}

	const handleEstorno = async (txID: string) => {
		if (!activeRegister) return
		if (!window.confirm("Deseja realmente estornar este lançamento manual? Esta ação é irreversível.")) {
			return
		}

		setActionLoading(true)
		setErrorMsg(null)

		const res = await http.delete(`/cash-registers/${activeRegister.id}/transactions/${txID}`)
		setActionLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		loadCaixa()
	}

	const handleExport = () => {
		if (!activeRegister) return
		window.open(`/api/cash-registers/${activeRegister.id}/export`, "_blank")
	}

	const getMethodLabel = (m: string) => {
		switch (m) {
			case "cash": return "Dinheiro"
			case "pix": return "PIX"
			case "card_debit": return "Débito"
			case "card_credit": return "Crédito"
			default: return "Outro"
		}
	}

	if (loading) {
		return (
			<div className="flex h-64 w-full items-center justify-center text-slate-400">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		)
	}

	return (
		<div className="space-y-6 w-full animate-fade-in">
			{/* Topo */}
			<div className="flex justify-between items-center flex-wrap gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Fluxo de Caixa</h1>
					<p className="text-sm text-slate-500 mt-1">Gerencie a abertura, fechamento e lançamentos financeiros da barbearia.</p>
				</div>
				<div className="flex gap-2.5">
					<Link href="/cliente/caixa/historico">
						<Button variant="ghost" className="border border-slate-200 bg-white font-bold">
							<i className="ti ti-history mr-1.5" /> Histórico de Caixas
						</Button>
					</Link>
					{activeRegister && (
						<>
							<Button variant="ghost" className="border border-slate-200 bg-white font-bold" onClick={handleExport}>
								<i className="ti ti-download mr-1.5" /> Exportar Lançamentos (CSV)
							</Button>
							<Button variant="ghost" className="border border-slate-200 bg-white font-bold" onClick={() => setTxModalOpen(true)}>
								<i className="ti ti-plus mr-1.5" /> Lançamento Manual
							</Button>
							<Button className="font-bold bg-red-600 hover:bg-red-700 text-white" onClick={() => {
								setClosingBalance(summary?.expected_balance.toFixed(2) || "0")
								setCloseModalOpen(true)
							}}>
								<i className="ti ti-lock mr-1.5" /> Fechar Caixa
							</Button>
						</>
					)}
				</div>
			</div>

			{errorMsg && <Alert variant="error" message={errorMsg} />}

			{/* ESTADO: CAIXA FECHADO */}
			{!activeRegister ? (
				<Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 text-center max-w-xl mx-auto rounded-2xl">
					<CardContent className="space-y-4">
						<div className="h-14 w-14 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-2xl mx-auto">
							<i className="ti ti-lock" />
						</div>
						<div className="space-y-1">
							<h2 className="text-lg font-bold text-slate-800">O Caixa está Fechado</h2>
							<p className="text-xs text-slate-400">Abra o caixa diário informando o saldo inicial em dinheiro para poder registrar pagamentos ou lançamentos.</p>
						</div>
						<Button className="font-bold mt-2" onClick={() => setOpenModalOpen(true)}>
							<i className="ti ti-key mr-1.5" /> Abrir Caixa Diário
						</Button>
					</CardContent>
				</Card>
			) : (
				/* ESTADO: CAIXA ABERTO */
				<div className="space-y-6">
					{/* Cards Estatísticos */}
					{summary && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="border-slate-100 shadow-sm">
								<CardContent className="p-4 flex items-center justify-between">
									<div>
										<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Estimado (Dinheiro Físico)</span>
										<span className="text-2xl font-black text-slate-800 mt-1 block">R$ {summary.expected_balance.toFixed(2)}</span>
									</div>
									<div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-lg">
										<i className="ti ti-cash" />
									</div>
								</CardContent>
							</Card>

							<Card className="border-slate-100 shadow-sm">
								<CardContent className="p-4 flex items-center justify-between">
									<div>
										<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Inicial em Caixa</span>
										<span className="text-2xl font-black text-slate-800 mt-1 block">R$ {activeRegister.opening_balance.toFixed(2)}</span>
									</div>
									<div className="h-10 w-10 rounded-full bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center text-lg">
										<i className="ti ti-scale" />
									</div>
								</CardContent>
							</Card>

							<Card className="border-slate-100 shadow-sm">
								<CardContent className="p-4 flex items-center justify-between">
									<div>
										<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Entradas</span>
										<span className="text-2xl font-black text-emerald-700 mt-1 block">+ R$ {summary.total_income.toFixed(2)}</span>
									</div>
									<div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-lg">
										<i className="ti ti-trending-up" />
									</div>
								</CardContent>
							</Card>

							<Card className="border-slate-100 shadow-sm">
								<CardContent className="p-4 flex items-center justify-between">
									<div>
										<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Saídas</span>
										<span className="text-2xl font-black text-red-700 mt-1 block">- R$ {summary.total_expense.toFixed(2)}</span>
									</div>
									<div className="h-10 w-10 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-lg">
										<i className="ti ti-trending-down" />
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Resumo detalhado de métodos de pagamento */}
					{summary && (
						<div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
							<h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métricas por Método de Lançamento</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
								{Object.entries(summary.method_totals).map(([method, total]) => (
									<div key={method} className="bg-slate-50 border border-slate-100/60 p-3.5 rounded-xl text-center">
										<span className="text-[10px] font-bold text-slate-400 uppercase">{getMethodLabel(method)}</span>
										<p className="text-base font-extrabold text-slate-800 mt-1">R$ {total.toFixed(2)}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Tabela de Transações */}
					<Card>
						<CardHeader className="py-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
							<div>
								<CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Transações do Caixa Atual</CardTitle>
								<CardDescription className="text-xs">Timeline dos lançamentos manuais e pagamentos do dia.</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-sm text-left text-slate-600">
									<thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
										<tr>
											<th className="px-6 py-4">Data/Hora</th>
											<th className="px-6 py-4">Categoria</th>
											<th className="px-6 py-4">Descrição</th>
											<th className="px-6 py-4">Método</th>
											<th className="px-6 py-4 text-right">Valor</th>
											<th className="px-6 py-4 text-center">Ações</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{transactions.length === 0 ? (
											<tr>
												<td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
													Nenhum lançamento efetuado neste caixa ainda.
												</td>
											</tr>
										) : (
											transactions.map((tx) => (
												<tr key={tx.id} className="hover:bg-slate-50/50 transition">
													<td className="px-6 py-4 text-slate-500 font-medium">
														{new Date(tx.created_at).toLocaleString("pt-BR")}
													</td>
													<td className="px-6 py-4">
														<span className="bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
															{tx.category || "Geral"}
														</span>
													</td>
													<td className="px-6 py-4 font-semibold text-slate-800">
														{tx.description}
													</td>
													<td className="px-6 py-4 font-semibold text-slate-500">
														{getMethodLabel(tx.method)}
													</td>
													<td className={`px-6 py-4 text-right font-black ${
														tx.type === "income" ? "text-emerald-600" : "text-red-600"
													}`}>
														{tx.type === "income" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
													</td>
													<td className="px-6 py-4 text-center">
														{!tx.appointment_payment_id ? (
															<Button
																size="sm"
																variant="ghost"
																disabled={actionLoading}
																onClick={() => handleEstorno(tx.id)}
																className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
															>
																Estornar
															</Button>
														) : (
															<span className="text-[10px] text-slate-400 italic">Pago no Agendamento</span>
														)}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* MODAL: ABERTURA DE CAIXA */}
			<Dialog open={openModalOpen} onOpenChange={setOpenModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Abrir Caixa Diário</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleOpenCaixa} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-slate-500 uppercase">Saldo Inicial em Dinheiro (R$)</label>
							<Input
								type="number"
								step="0.01"
								required
								value={openingBalance}
								onChange={(e) => setOpeningBalance(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-slate-500 uppercase">Observações Opcionais</label>
							<textarea
								value={openNotes}
								onChange={(e) => setOpenNotes(e.target.value)}
								placeholder="Lançamento de troco inicial no caixa físico..."
								className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
							/>
						</div>
						<DialogFooter className="pt-2 border-t border-slate-100">
							<Button type="button" variant="ghost" onClick={() => setOpenModalOpen(false)}>
								Cancelar
							</Button>
							<Button type="submit" disabled={actionLoading} className="font-bold">
								Confirmar Abertura
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* MODAL: FECHAMENTO DE CAIXA */}
			<Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Fechar Caixa Diário</DialogTitle>
					</DialogHeader>
					{summary && (
						<form onSubmit={handleCloseCaixa} className="space-y-4 py-2">
							<div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 text-xs">
								<div className="flex justify-between items-center text-slate-500 font-semibold">
									<span>Saldo Estimado (Dinheiro):</span>
									<span className="font-bold text-slate-800">R$ {summary.expected_balance.toFixed(2)}</span>
								</div>
								<div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-200/50 pt-2">
									<span>Dinheiro Contado no Fechamento:</span>
									<span className="font-bold text-slate-800">
										R$ {(parseFloat(closingBalance) || 0).toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between items-center font-extrabold border-t border-slate-200/50 pt-2">
									<span>Divergência:</span>
									<span className={
										(parseFloat(closingBalance) || 0) - summary.expected_balance === 0
											? "text-slate-700"
											: (parseFloat(closingBalance) || 0) - summary.expected_balance > 0
											? "text-emerald-600"
											: "text-red-600"
									}>
										{((parseFloat(closingBalance) || 0) - summary.expected_balance) === 0 ? "" : ((parseFloat(closingBalance) || 0) - summary.expected_balance) > 0 ? "+" : "-"}
										R$ {Math.abs((parseFloat(closingBalance) || 0) - summary.expected_balance).toFixed(2)}
									</span>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold text-slate-500 uppercase">Valor Físico Contado (R$)</label>
								<Input
									type="number"
									step="0.01"
									required
									value={closingBalance}
									onChange={(e) => setClosingBalance(e.target.value)}
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold text-slate-500 uppercase">Observações / Justificativas</label>
								<textarea
									value={closeNotes}
									onChange={(e) => setCloseNotes(e.target.value)}
									placeholder="Caso haja diferença no saldo físico contado, descreva o motivo aqui..."
									className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
								/>
							</div>

							<DialogFooter className="pt-2 border-t border-slate-100">
								<Button type="button" variant="ghost" onClick={() => setCloseModalOpen(false)}>
									Cancelar
								</Button>
								<Button type="submit" disabled={actionLoading} className="font-bold bg-red-600 hover:bg-red-700 text-white">
									Confirmar Fechamento
								</Button>
							</DialogFooter>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* MODAL: LANÇAMENTO MANUAL */}
			<Dialog open={txModalOpen} onOpenChange={setTxModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Lançamento Manual de Caixa</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateTransaction} className="space-y-4 py-2">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
								<Select value={txType} onValueChange={setTxType}>
									<SelectTrigger className="text-xs font-semibold">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="income">Entrada (Receita)</SelectItem>
										<SelectItem value="expense">Saída (Despesa)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold text-slate-500 uppercase">Método</label>
								<Select value={txMethod} onValueChange={setTxMethod}>
									<SelectTrigger className="text-xs font-semibold">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="cash">Dinheiro</SelectItem>
										<SelectItem value="pix">PIX</SelectItem>
										<SelectItem value="card_debit">Cartão Débito</SelectItem>
										<SelectItem value="card_credit">Cartão Crédito</SelectItem>
										<SelectItem value="other">Outro</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
								<Input
									type="number"
									step="0.01"
									required
									value={txAmount}
									onChange={(e) => setTxAmount(e.target.value)}
									placeholder="0.00"
								/>
							</div>

							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
								<Input
									value={txCategory}
									onChange={(e) => setTxCategory(e.target.value)}
									placeholder="Ex: Suprimentos, Aluguel"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
							<Input
								required
								value={txDescription}
								onChange={(e) => setTxDescription(e.target.value)}
								placeholder="Ex: Compra de café espresso para estoque"
							/>
						</div>

						<DialogFooter className="pt-2 border-t border-slate-100">
							<Button type="button" variant="ghost" onClick={() => setTxModalOpen(false)}>
								Cancelar
							</Button>
							<Button type="submit" disabled={actionLoading} className="font-bold">
								Registrar Lançamento
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
