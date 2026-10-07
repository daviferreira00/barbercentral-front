"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"
import { ShieldCheck, Plus, Pencil, Loader2, Sparkles, Zap, Crown, CheckCircle2, XCircle, Users, Database, LayoutDashboard } from "lucide-react"

interface Plan {
	id: string
	name: string
	max_professionals: number
	max_customers: number
	max_users: number
	has_loyalty: number
	has_stock: number
	has_reports: number
	has_online_booking: number
	has_whatsapp?: number
	is_public: number
	price: number
}

export default function AdminPlansListPage() {
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const loadPlans = async () => {
		setLoading(true)
		setErrorMsg(null)
		const res = await http.get<Plan[]>("/admin/plans")
		setLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message || "Erro ao carregar planos")
			return
		}
		if (res.data) {
			setPlans(res.data)
		}
	}

	useEffect(() => {
		loadPlans()
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground text-sm font-medium">Carregando planos da plataforma...</span>
			</div>
		)
	}

	return (
		<div className="container max-w-5xl py-8 space-y-8 animate-in fade-in duration-300">
			<div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight">Planos de Assinatura</h1>
					<p className="text-muted-foreground text-sm mt-1">Gerencie os planos, limites e preços oferecidos na plataforma.</p>
				</div>
				<div className="flex gap-3">
					<Link href="/admin">
						<Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold">
							Voltar ao Admin
						</Button>
					</Link>
					<Link href="/admin/planos/novo">
						<Button size="sm" className="h-9 px-4 text-xs font-bold">
							<Plus className="h-4 w-4 mr-1.5" /> Novo Plano
						</Button>
					</Link>
				</div>
			</div>

			{errorMsg && (
				<Alert variant="error">
					{errorMsg}
				</Alert>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				{plans.length === 0 ? (
					<div className="col-span-2 text-center text-slate-400 p-12">Nenhum plano cadastrado.</div>
				) : (
					plans.map((p) => {
						const isPro = p.name.toLowerCase().includes("pro")
						const isSmart = p.name.toLowerCase().includes("smart")
						const isFree = p.price === 0

						if (isPro) {
							// Card PRO: Fundo Azul Escuro + Destaque AZUL / INDIGO
							return (
								<Card 
									key={p.id} 
									className="relative flex flex-col justify-between border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-2xl rounded-3xl overflow-hidden hover:border-indigo-400 hover:scale-[1.01] transition-all duration-300"
								>
									{/* Marca d'água de fundo (Icon Watermark) */}
									<Sparkles className="absolute -right-6 -bottom-6 h-48 w-48 text-indigo-500/10 pointer-events-none transform translate-x-2 translate-y-2" />

									{/* Banner Superior */}
									<div className="bg-indigo-500/20 border-b border-indigo-500/30 py-2 px-4 text-center">
										<span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center justify-center gap-1.5">
											<Crown className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400/30" /> Mais Recomendado • Automação Total
										</span>
									</div>

									<div className="p-6 pb-4 border-b border-white/10 relative z-10">
										<div className="flex justify-between items-start">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
														<Crown className="h-5 w-5 fill-indigo-400/20" />
													</div>
													<CardTitle className="text-2xl font-black tracking-tight text-white uppercase">{p.name}</CardTitle>
												</div>
												<p className="text-xs text-indigo-200/70 font-medium mt-1">Equipe ilimitada + WhatsApp e Fidelidade</p>
											</div>
											<span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
												{p.is_public === 1 ? "Público" : "Privado"}
											</span>
										</div>

										<div className="mt-5 flex items-baseline gap-1">
											<span className="text-4xl font-black text-indigo-400 tracking-tight">
												{isFree ? "Grátis" : `R$ ${p.price.toFixed(2)}`}
											</span>
											<span className="text-xs font-semibold text-slate-400">/ mês</span>
										</div>
									</div>

									<CardContent className="p-6 space-y-6 flex-grow text-xs relative z-10">
										{/* Limites */}
										<div className="space-y-2.5 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
											<div className="flex justify-between items-center text-slate-300">
												<span className="font-medium flex items-center gap-2">
													<Users className="h-3.5 w-3.5 text-indigo-400" /> Profissionais (Cadeiras):
												</span>
												<span className="font-black text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded text-[11px] border border-indigo-500/30">
													{p.max_professionals === -1 ? "Ilimitado" : p.max_professionals}
												</span>
											</div>
											<div className="flex justify-between items-center text-slate-300">
												<span className="font-medium flex items-center gap-2">
													<Database className="h-3.5 w-3.5 text-indigo-400" /> Clientes na Base:
												</span>
												<span className="font-black text-white">
													{p.max_customers === -1 ? "Ilimitado" : p.max_customers}
												</span>
											</div>
											<div className="flex justify-between items-center text-slate-300">
												<span className="font-medium flex items-center gap-2">
													<LayoutDashboard className="h-3.5 w-3.5 text-indigo-400" /> Usuários de Painel:
												</span>
												<span className="font-black text-white">
													{p.max_users === -1 ? "Ilimitado" : p.max_users}
												</span>
											</div>
										</div>

										{/* Lista de Features */}
										<div className="space-y-3">
											<span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Recursos Inclusos</span>
											<div className="space-y-2.5 text-[11px] font-semibold">
												<div className="flex items-center gap-2 text-indigo-300">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
													<span>Agendamento Online Público</span>
												</div>
												<div className="flex items-center gap-2 text-indigo-300">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
													<span>WhatsApp Total (Lembretes & Disparos)</span>
												</div>
												<div className="flex items-center gap-2 text-indigo-300">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
													<span>Programa de Fidelidade (Pontos/Stamps)</span>
												</div>
												<div className="flex items-center gap-2 text-indigo-300">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
													<span>Relatórios & Gráficos Financeiros</span>
												</div>
												<div className="flex items-center gap-2 text-indigo-300">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
													<span>Gestão de Estoque & Consumo</span>
												</div>
											</div>
										</div>
									</CardContent>

									<div className="p-6 pt-0 relative z-10">
										<Link href={`/admin/planos/${p.id}`} className="block w-full">
											<Button className="w-full bg-indigo-600 text-white font-black hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 h-11 text-xs uppercase tracking-wider">
												<Pencil className="h-4 w-4 mr-2" /> Editar Plano Pro
											</Button>
										</Link>
									</div>
								</Card>
							)
						}

						// Card SMART: Fundo Azul Escuro + Destaque VERDE / EMERALD
						return (
							<Card 
								key={p.id} 
								className="relative flex flex-col justify-between border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-2xl rounded-3xl overflow-hidden hover:border-emerald-400 hover:scale-[1.01] transition-all duration-300"
							>
								{/* Marca d'água de fundo (Icon Watermark) */}
								<Zap className="absolute -right-6 -bottom-6 h-48 w-48 text-emerald-500/10 pointer-events-none transform translate-x-2 translate-y-2" />

								{/* Banner Superior */}
								<div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center">
									<span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
										<Zap className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/30" /> Entrada Operacional • 1 a 3 Cadeiras
									</span>
								</div>

								<div className="p-6 pb-4 border-b border-white/10 relative z-10">
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
													<Zap className="h-5 w-5 fill-emerald-400/20" />
												</div>
												<CardTitle className="text-2xl font-black tracking-tight text-white uppercase">{p.name}</CardTitle>
											</div>
											<p className="text-xs text-emerald-200/70 font-medium mt-1">Operação essencial para barbearias iniciantes</p>
										</div>
										<span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
											{p.is_public === 1 ? "Público" : "Privado"}
										</span>
									</div>

									<div className="mt-5 flex items-baseline gap-1">
										<span className="text-4xl font-black text-emerald-400 tracking-tight">
											{isFree ? "Grátis" : `R$ ${p.price.toFixed(2)}`}
										</span>
										<span className="text-xs font-semibold text-slate-400">/ mês</span>
									</div>
								</div>

								<CardContent className="p-6 space-y-6 flex-grow text-xs relative z-10">
									{/* Limites */}
									<div className="space-y-2.5 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
										<div className="flex justify-between items-center text-slate-300">
											<span className="font-medium flex items-center gap-2">
												<Users className="h-3.5 w-3.5 text-emerald-400" /> Profissionais (Cadeiras):
											</span>
											<span className="font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] border border-emerald-500/30">
												{p.max_professionals === -1 ? "Ilimitado" : `Até ${p.max_professionals}`}
											</span>
										</div>
										<div className="flex justify-between items-center text-slate-300">
											<span className="font-medium flex items-center gap-2">
												<Database className="h-3.5 w-3.5 text-emerald-400" /> Clientes na Base:
											</span>
											<span className="font-black text-white">
												{p.max_customers === -1 ? "Ilimitado" : p.max_customers}
											</span>
										</div>
										<div className="flex justify-between items-center text-slate-300">
											<span className="font-medium flex items-center gap-2">
												<LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" /> Usuários de Painel:
											</span>
											<span className="font-black text-white">
												{p.max_users === -1 ? "Ilimitado" : p.max_users}
											</span>
										</div>
									</div>

									{/* Lista de Features */}
									<div className="space-y-3">
										<span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Recursos Inclusos</span>
										<div className="space-y-2.5 text-[11px] font-semibold">
											<div className="flex items-center gap-2 text-emerald-300">
												<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
												<span>Agendamento Online Público</span>
											</div>
											<div className="flex items-center gap-2 text-emerald-300">
												<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
												<span>Gestão de Horários & Caixa</span>
											</div>
											<div className="flex items-center gap-2 text-emerald-300">
												<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
												<span>Cadastro & Histórico de Clientes</span>
											</div>
											<div className="flex items-center justify-between gap-2 text-slate-400 pt-1 border-t border-white/5">
												<div className="flex items-center gap-2 line-through">
													<XCircle className="h-4 w-4 shrink-0 text-slate-500" />
													<span>WhatsApp Automático</span>
												</div>
												<span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">Exclusivo Pro</span>
											</div>
											<div className="flex items-center justify-between gap-2 text-slate-400">
												<div className="flex items-center gap-2 line-through">
													<XCircle className="h-4 w-4 shrink-0 text-slate-500" />
													<span>Programa de Fidelidade</span>
												</div>
												<span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">Exclusivo Pro</span>
											</div>
										</div>
									</div>
								</CardContent>

								<div className="p-6 pt-0 relative z-10">
									<Link href={`/admin/planos/${p.id}`} className="block w-full">
										<Button className="w-full bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 h-11 text-xs uppercase tracking-wider">
											<Pencil className="h-4 w-4 mr-2" /> Editar Plano Smart
										</Button>
									</Link>
								</div>
							</Card>
						)
					})
				)}
			</div>
		</div>
	)
}

