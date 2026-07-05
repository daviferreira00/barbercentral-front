"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { useCaixaHistorico } from "@/features/caixa/hooks/useCaixaHistorico"
import { getMethodLabel } from "@/features/caixa/types"

export default function HistoricoMobile() {
	const {
		registers,
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
		<div className="flex flex-col gap-4 animate-fade-in">
			{/* Topo com retorno */}
			<div className="flex items-center gap-3">
				<Link
					href="/cliente/caixa"
					aria-label="Voltar ao caixa"
					className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
				>
					<i className="ti ti-arrow-left" />
				</Link>
				<div>
					<h1 className="text-xl font-extrabold text-slate-800">Histórico de Caixas</h1>
					<p className="text-xs font-semibold text-slate-400">Fechamentos anteriores e transações.</p>
				</div>
			</div>

			{errorMsg && <Alert variant="error" message={errorMsg} />}

			{loading ? (
				<SkeletonList count={6} />
			) : registers.length === 0 ? (
				<EmptyState
					icon="ti-archive"
					title="Nenhum caixa registrado"
					description="Os caixas fechados aparecem aqui."
				/>
			) : (
				<div className="flex flex-col gap-3">
					{registers.map((reg, i) => (
						<ListCard
							key={reg.id}
							index={i}
							title={new Date(reg.opened_at).toLocaleDateString("pt-BR", {
								weekday: "short",
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})}
							subtitle={`Aberto às ${new Date(reg.opened_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}${
								reg.closed_at
									? ` · fechado às ${new Date(reg.closed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
									: ""
							}`}
							pill={
								reg.status === "open"
									? { label: "Aberto", tone: "info" }
									: { label: "Fechado", tone: "neutral" }
							}
							footerLeft={<span>Inicial: R$ {reg.opening_balance.toFixed(2)}</span>}
							footerRight={
								<span>
									{reg.closing_balance !== undefined ? `Final: R$ ${reg.closing_balance.toFixed(2)}` : "—"}
								</span>
							}
							onClick={() => setSelectedReg(reg)}
						/>
					))}
				</div>
			)}

			{/* Paginação */}
			{!loading && totalPages > 1 && (
				<div className="flex items-center justify-between">
					<button
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
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
						onClick={() => setPage(page + 1)}
						className="mobile-tap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition active:scale-95 disabled:opacity-40"
					>
						Próxima
						<i className="ti ti-chevron-right ml-1" />
					</button>
				</div>
			)}

			{/* SHEET: DETALHES DO CAIXA */}
			<BottomSheet
				open={selectedReg !== null}
				onClose={() => setSelectedReg(null)}
				title={`Resumo do Caixa (${selectedReg?.status === "open" ? "Aberto" : "Fechado"})`}
				subtitle={selectedReg ? new Date(selectedReg.opened_at).toLocaleString("pt-BR") : undefined}
				footer={
					selectedReg?.status === "closed" ? (
						<button
							onClick={() => window.open(`/api/cash-registers/${selectedReg.id}/export`, "_blank")}
							className="mobile-tap w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-600 transition active:scale-[0.98]"
						>
							<i className="ti ti-download mr-1.5" />
							Exportar Lançamentos (CSV)
						</button>
					) : undefined
				}
			>
				{selectedReg && (
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-2">
							<div className="rounded-xl bg-slate-50 p-3">
								<p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Abertura</p>
								<p className="mt-1 text-xs font-extrabold text-slate-800">
									{new Date(selectedReg.opened_at).toLocaleString("pt-BR")}
								</p>
								<p className="text-[10px] text-slate-400">Saldo: R$ {selectedReg.opening_balance.toFixed(2)}</p>
							</div>
							<div className="rounded-xl bg-slate-50 p-3">
								<p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Fechamento</p>
								<p className="mt-1 text-xs font-extrabold text-slate-800">
									{selectedReg.closed_at ? new Date(selectedReg.closed_at).toLocaleString("pt-BR") : "Aberto"}
								</p>
								{selectedReg.closing_balance !== undefined && (
									<p className="text-[10px] text-slate-400">Saldo: R$ {selectedReg.closing_balance.toFixed(2)}</p>
								)}
							</div>
						</div>

						{selectedReg.notes && (
							<div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
								<p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
									Observações
								</p>
								<p className="text-xs font-medium italic text-amber-800">{selectedReg.notes}</p>
							</div>
						)}

						<div>
							<p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
								Lançamentos
							</p>
							{loadingTxs ? (
								<div className="space-y-2">
									<div className="skeleton-shimmer h-12 rounded-xl" />
									<div className="skeleton-shimmer h-12 rounded-xl" />
								</div>
							) : transactions.length === 0 ? (
								<p className="py-2 text-center text-[11px] italic text-slate-400">
									Nenhum lançamento neste caixa.
								</p>
							) : (
								<div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
									{transactions.map((tx) => (
										<div key={tx.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
											<div className="min-w-0">
												<p className="truncate text-xs font-extrabold text-slate-800">{tx.description}</p>
												<p className="text-[10px] font-semibold text-slate-400">
													{new Date(tx.created_at).toLocaleString("pt-BR")} · {getMethodLabel(tx.method)}
												</p>
											</div>
											<span
												className={`shrink-0 text-xs font-black ${
													tx.type === "income" ? "text-emerald-600" : "text-red-600"
												}`}
											>
												{tx.type === "income" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</BottomSheet>
		</div>
	)
}
