"use client"

import { useState } from "react"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { KpiCard } from "@/components/mobile/KpiCard"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonKpis, SkeletonList } from "@/components/mobile/Skeleton"
import { haptic } from "@/shared/lib/haptics"
import { useCaixa } from "@/features/caixa/hooks/useCaixa"
import { getMethodLabel, type CashTransaction } from "@/features/caixa/types"

export default function CaixaMobile() {
	const {
		activeRegister,
		summary,
		transactions,
		loading,
		actionLoading,
		errorMsg,
		openModalOpen,
		setOpenModalOpen,
		closeModalOpen,
		setCloseModalOpen,
		txModalOpen,
		setTxModalOpen,
		openingBalance,
		setOpeningBalance,
		openNotes,
		setOpenNotes,
		closingBalance,
		setClosingBalance,
		closeNotes,
		setCloseNotes,
		txType,
		setTxType,
		txAmount,
		setTxAmount,
		txMethod,
		setTxMethod,
		txDescription,
		setTxDescription,
		txCategory,
		setTxCategory,
		handleOpenCaixa,
		handleCloseCaixa,
		handleCreateTransaction,
		handleEstorno,
		handleExport,
	} = useCaixa()

	const [selectedTx, setSelectedTx] = useState<CashTransaction | null>(null)

	const labelCls = "mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400"
	const textareaCls =
		"flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"

	if (loading) {
		return (
			<div className="flex flex-col gap-4">
				<SkeletonKpis />
				<SkeletonList count={4} />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 animate-fade-in">
			{/* Título + ações */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-extrabold text-slate-800">Caixa</h1>
					<p className="text-xs font-semibold text-slate-400">
						{activeRegister ? "Caixa aberto — movimentações do dia" : "Caixa fechado"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Link
						href="/cliente/caixa/historico"
						onClick={() => haptic()}
						aria-label="Histórico de caixas"
						className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition active:scale-90"
					>
						<i className="ti ti-history" />
					</Link>
					{activeRegister && (
						<>
							<button
								onClick={handleExport}
								aria-label="Exportar CSV"
								className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition active:scale-90"
							>
								<i className="ti ti-download" />
							</button>
							<button
								onClick={() => {
									haptic()
									setClosingBalance(summary?.expected_balance.toFixed(2) || "0")
									setCloseModalOpen(true)
								}}
								aria-label="Fechar caixa"
								className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg text-red-600 transition active:scale-90"
							>
								<i className="ti ti-lock" />
							</button>
						</>
					)}
				</div>
			</div>

			{errorMsg && <Alert variant="error" message={errorMsg} />}

			{/* ESTADO: CAIXA FECHADO */}
			{!activeRegister ? (
				<EmptyState
					icon="ti-lock"
					title="O caixa está fechado"
					description="Abra o caixa diário informando o saldo inicial em dinheiro."
					action={
						<button
							onClick={() => {
								haptic()
								setOpenModalOpen(true)
							}}
							className="mobile-tap rounded-xl px-6 py-3 text-sm font-extrabold text-white shadow-md transition active:scale-95"
							style={{ backgroundColor: "var(--color-primary)" }}
						>
							<i className="ti ti-key mr-1.5" />
							Abrir Caixa Diário
						</button>
					}
				/>
			) : (
				<>
					{/* Indicadores */}
					{summary && (
						<div className="grid grid-cols-2 gap-3">
							<KpiCard
								className="col-span-2"
								label="Saldo estimado (dinheiro)"
								value={`R$ ${summary.expected_balance.toFixed(2)}`}
								icon="ti-cash"
								hint={`Saldo inicial: R$ ${activeRegister.opening_balance.toFixed(2)}`}
							/>
							<div className="animate-card-enter rounded-[20px] border border-emerald-100 bg-emerald-50 p-4">
								<p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Entradas</p>
								<p className="mt-1 text-lg font-extrabold text-emerald-700">
									+ R$ {summary.total_income.toFixed(2)}
								</p>
							</div>
							<div className="animate-card-enter rounded-[20px] border border-red-100 bg-red-50 p-4">
								<p className="text-[10px] font-extrabold uppercase tracking-widest text-red-500">Saídas</p>
								<p className="mt-1 text-lg font-extrabold text-red-600">
									- R$ {summary.total_expense.toFixed(2)}
								</p>
							</div>
						</div>
					)}

					{/* Totais por método (rolagem horizontal) */}
					{summary && Object.keys(summary.method_totals).length > 0 && (
						<div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
							{Object.entries(summary.method_totals).map(([method, total]) => (
								<div
									key={method}
									className="shrink-0 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 text-center shadow-sm"
								>
									<span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
										{getMethodLabel(method)}
									</span>
									<span className="text-sm font-extrabold text-slate-800">R$ {total.toFixed(2)}</span>
								</div>
							))}
						</div>
					)}

					{/* Transações */}
					<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
						Transações do caixa
					</h2>

					{transactions.length === 0 ? (
						<EmptyState
							icon="ti-receipt"
							title="Nenhum lançamento ainda"
							description="Use o botão + para registrar um lançamento manual."
						/>
					) : (
						<div className="flex flex-col gap-3">
							{transactions.map((tx, i) => (
								<ListCard
									key={tx.id}
									index={i}
									title={tx.description}
									subtitle={`${tx.category || "Geral"} · ${getMethodLabel(tx.method)}`}
									pill={
										tx.type === "income"
											? { label: "Entrada", tone: "success" }
											: { label: "Saída", tone: "danger" }
									}
									footerLeft={
										<span>
											<i className="ti ti-clock mr-1 text-slate-400" />
											{new Date(tx.created_at).toLocaleString("pt-BR")}
										</span>
									}
									footerRight={
										<span className={tx.type === "income" ? "text-emerald-600" : "text-red-600"}>
											{tx.type === "income" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
										</span>
									}
									onClick={() => setSelectedTx(tx)}
								/>
							))}
						</div>
					)}

					<Fab icon="ti-plus" onClick={() => setTxModalOpen(true)} ariaLabel="Lançamento manual" />
				</>
			)}

			{/* SHEET: DETALHE DA TRANSAÇÃO */}
			<BottomSheet
				open={selectedTx !== null}
				onClose={() => setSelectedTx(null)}
				title={selectedTx?.description || ""}
				subtitle={selectedTx ? new Date(selectedTx.created_at).toLocaleString("pt-BR") : undefined}
				footer={
					selectedTx && !selectedTx.appointment_payment_id ? (
						<button
							disabled={actionLoading}
							onClick={async () => {
								await handleEstorno(selectedTx.id)
								setSelectedTx(null)
							}}
							className="mobile-tap w-full rounded-xl bg-red-50 py-3 text-xs font-extrabold text-red-600 transition active:scale-[0.98] disabled:opacity-50"
						>
							<i className="ti ti-arrow-back-up mr-1.5" />
							Estornar lançamento
						</button>
					) : (
						<p className="text-center text-[11px] font-semibold italic text-slate-400">
							Pago no agendamento — não pode ser estornado aqui.
						</p>
					)
				}
			>
				{selectedTx && (
					<div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
						{[
							{
								label: "Valor",
								value: (
									<span className={selectedTx.type === "income" ? "text-emerald-600" : "text-red-600"}>
										{selectedTx.type === "income" ? "+" : "-"} R$ {selectedTx.amount.toFixed(2)}
									</span>
								),
							},
							{ label: "Tipo", value: selectedTx.type === "income" ? "Entrada (Receita)" : "Saída (Despesa)" },
							{ label: "Método", value: getMethodLabel(selectedTx.method) },
							{ label: "Categoria", value: selectedTx.category || "Geral" },
						].map((row) => (
							<div key={row.label} className="flex items-center justify-between px-4 py-2.5">
								<span className="text-xs font-bold text-slate-400">{row.label}</span>
								<span className="text-xs font-extrabold text-slate-700">{row.value}</span>
							</div>
						))}
					</div>
				)}
			</BottomSheet>

			{/* SHEET: ABERTURA DE CAIXA */}
			<BottomSheet
				open={openModalOpen}
				onClose={() => !actionLoading && setOpenModalOpen(false)}
				title="Abrir Caixa Diário"
			>
				<form onSubmit={handleOpenCaixa} className="flex flex-col gap-4">
					<div>
						<label className={labelCls}>Saldo inicial em dinheiro (R$)</label>
						<Input
							type="number"
							step="0.01"
							required
							value={openingBalance}
							onChange={(e) => setOpeningBalance(e.target.value)}
							className="h-11 rounded-xl text-base"
						/>
					</div>
					<div>
						<label className={labelCls}>Observações opcionais</label>
						<textarea
							value={openNotes}
							onChange={(e) => setOpenNotes(e.target.value)}
							placeholder="Lançamento de troco inicial no caixa físico..."
							className={textareaCls}
						/>
					</div>
					<button
						type="submit"
						disabled={actionLoading}
						className="mobile-tap rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						{actionLoading ? "Abrindo..." : "Confirmar Abertura"}
					</button>
				</form>
			</BottomSheet>

			{/* SHEET: FECHAMENTO DE CAIXA */}
			<BottomSheet
				open={closeModalOpen}
				onClose={() => !actionLoading && setCloseModalOpen(false)}
				title="Fechar Caixa Diário"
			>
				{summary && (
					<form onSubmit={handleCloseCaixa} className="flex flex-col gap-4">
						<div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
							<div className="flex items-center justify-between font-semibold text-slate-500">
								<span>Saldo estimado (dinheiro):</span>
								<span className="font-bold text-slate-800">R$ {summary.expected_balance.toFixed(2)}</span>
							</div>
							<div className="flex items-center justify-between border-t border-slate-200/50 pt-2 font-semibold text-slate-500">
								<span>Dinheiro contado:</span>
								<span className="font-bold text-slate-800">R$ {(parseFloat(closingBalance) || 0).toFixed(2)}</span>
							</div>
							<div className="flex items-center justify-between border-t border-slate-200/50 pt-2 font-extrabold">
								<span>Divergência:</span>
								<span
									className={
										(parseFloat(closingBalance) || 0) - summary.expected_balance === 0
											? "text-slate-700"
											: (parseFloat(closingBalance) || 0) - summary.expected_balance > 0
											? "text-emerald-600"
											: "text-red-600"
									}
								>
									{((parseFloat(closingBalance) || 0) - summary.expected_balance) === 0
										? ""
										: ((parseFloat(closingBalance) || 0) - summary.expected_balance) > 0
										? "+"
										: "-"}
									R$ {Math.abs((parseFloat(closingBalance) || 0) - summary.expected_balance).toFixed(2)}
								</span>
							</div>
						</div>

						<div>
							<label className={labelCls}>Valor físico contado (R$)</label>
							<Input
								type="number"
								step="0.01"
								required
								value={closingBalance}
								onChange={(e) => setClosingBalance(e.target.value)}
								className="h-11 rounded-xl text-base"
							/>
						</div>

						<div>
							<label className={labelCls}>Observações / Justificativas</label>
							<textarea
								value={closeNotes}
								onChange={(e) => setCloseNotes(e.target.value)}
								placeholder="Caso haja diferença no saldo físico contado, descreva o motivo aqui..."
								className={textareaCls}
							/>
						</div>

						<button
							type="submit"
							disabled={actionLoading}
							className="mobile-tap rounded-xl bg-red-600 py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
						>
							{actionLoading ? "Fechando..." : "Confirmar Fechamento"}
						</button>
					</form>
				)}
			</BottomSheet>

			{/* SHEET: LANÇAMENTO MANUAL */}
			<BottomSheet
				open={txModalOpen}
				onClose={() => !actionLoading && setTxModalOpen(false)}
				title="Lançamento Manual"
			>
				<form onSubmit={handleCreateTransaction} className="flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className={labelCls}>Tipo</label>
							<Select value={txType} onValueChange={setTxType}>
								<SelectTrigger className="h-11 rounded-xl text-sm font-semibold">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="income">Entrada (Receita)</SelectItem>
									<SelectItem value="expense">Saída (Despesa)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className={labelCls}>Método</label>
							<Select value={txMethod} onValueChange={setTxMethod}>
								<SelectTrigger className="h-11 rounded-xl text-sm font-semibold">
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

					<div>
						<label className={labelCls}>Valor (R$)</label>
						<Input
							type="number"
							step="0.01"
							required
							value={txAmount}
							onChange={(e) => setTxAmount(e.target.value)}
							placeholder="0.00"
							className="h-11 rounded-xl text-base"
						/>
					</div>

					<div>
						<label className={labelCls}>Categoria</label>
						<Input
							value={txCategory}
							onChange={(e) => setTxCategory(e.target.value)}
							placeholder="Ex: Suprimentos, Aluguel"
							className="h-11 rounded-xl text-base"
						/>
					</div>

					<div>
						<label className={labelCls}>Descrição</label>
						<Input
							required
							value={txDescription}
							onChange={(e) => setTxDescription(e.target.value)}
							placeholder="Ex: Compra de café espresso para estoque"
							className="h-11 rounded-xl text-base"
						/>
					</div>

					<button
						type="submit"
						disabled={actionLoading}
						className="mobile-tap rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						{actionLoading ? "Registrando..." : "Registrar Lançamento"}
					</button>
				</form>
			</BottomSheet>
		</div>
	)
}
