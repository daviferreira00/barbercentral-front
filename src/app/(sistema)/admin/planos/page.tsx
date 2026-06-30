"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"
import { ShieldCheck, Plus, Pencil, Loader2, Sparkles } from "lucide-react"

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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{plans.length === 0 ? (
					<div className="col-span-3 text-center text-slate-400 p-12">Nenhum plano cadastrado.</div>
				) : (
					plans.map((p) => {
						const isFree = p.price === 0
						return (
							<Card key={p.id} className={`flex flex-col justify-between border hover:shadow-lg transition ${p.is_public === 1 ? 'border-border' : 'border-dashed border-slate-300'}`}>
								<CardHeader className="pb-3 border-b">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg font-black uppercase text-slate-800">{p.name}</CardTitle>
											<span className="text-[10px] font-bold text-slate-400 block mt-0.5">
												ID: {p.id.substring(0, 8)}...
											</span>
										</div>
										<span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.is_public === 1 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
											{p.is_public === 1 ? "Público" : "Privado"}
										</span>
									</div>
									<div className="mt-4">
										<span className="text-3xl font-black text-slate-900 block">
											{isFree ? "Grátis" : `R$ ${p.price.toFixed(2)}`}
										</span>
									</div>
								</CardHeader>
								<CardContent className="py-6 flex-grow space-y-4 text-xs text-slate-600">
									<div className="space-y-2 border-b pb-3">
										<div className="flex justify-between">
											<span className="font-semibold text-slate-500">Profissionais:</span>
											<span className="font-black text-slate-800">{p.max_professionals === -1 ? "Ilimitado" : p.max_professionals}</span>
										</div>
										<div className="flex justify-between">
											<span className="font-semibold text-slate-500">Clientes na Base:</span>
											<span className="font-black text-slate-800">{p.max_customers === -1 ? "Ilimitado" : p.max_customers}</span>
										</div>
										<div className="flex justify-between">
											<span className="font-semibold text-slate-500">Usuários de Painel:</span>
											<span className="font-black text-slate-800">{p.max_users === -1 ? "Ilimitado" : p.max_users}</span>
										</div>
									</div>

									<div className="space-y-2">
										<span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Features Integradas</span>
										<div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
											<span className={p.has_online_booking === 1 ? "text-emerald-600" : "text-slate-350 line-through font-normal"}>✓ Online Booking</span>
											<span className={p.has_loyalty === 1 ? "text-emerald-600" : "text-slate-350 line-through font-normal"}>✓ Fidelidade</span>
											<span className={p.has_stock === 1 ? "text-emerald-600" : "text-slate-350 line-through font-normal"}>✓ Estoque</span>
											<span className={p.has_reports === 1 ? "text-emerald-600" : "text-slate-350 line-through font-normal"}>✓ Relatórios</span>
										</div>
									</div>
								</CardContent>
								<div className="p-6 pt-0">
									<Link href={`/admin/planos/${p.id}`} className="block w-full">
										<Button variant="outline" className="w-full text-xs font-bold h-9">
											<Pencil className="h-4 w-4 mr-1.5" /> Editar Plano
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
