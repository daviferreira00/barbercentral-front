"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Loader2, ArrowLeft, Save } from "lucide-react"

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

export default function AdminPlanDetailPage({ params }: { params: { id: string } }) {
	const router = useRouter()
	const planId = params.id
	const isNew = planId === "novo"

	const [loading, setLoading] = useState(!isNew)
	const [saving, setSaving] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	// Campos do Form
	const [name, setName] = useState("")
	const [price, setPrice] = useState("0")
	const [maxProfessionals, setMaxProfessionals] = useState("5")
	const [maxCustomers, setMaxCustomers] = useState("500")
	const [maxUsers, setMaxUsers] = useState("3")
	const [hasLoyalty, setHasLoyalty] = useState(false)
	const [hasStock, setHasStock] = useState(false)
	const [hasReports, setHasReports] = useState(false)
	const [hasOnlineBooking, setHasOnlineBooking] = useState(true)
	const [isPublic, setIsPublic] = useState(true)

	const loadPlan = async () => {
		if (isNew) return
		setLoading(true)
		setErrorMsg(null)
		
		const res = await http.get<Plan[]>("/admin/plans")
		setLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message || "Erro ao buscar planos")
			return
		}

		if (res.data) {
			const match = res.data.find((p) => p.id === planId)
			if (match) {
				setName(match.name)
				setPrice(String(match.price))
				setMaxProfessionals(String(match.max_professionals))
				setMaxCustomers(String(match.max_customers))
				setMaxUsers(String(match.max_users))
				setHasLoyalty(match.has_loyalty === 1)
				setHasStock(match.has_stock === 1)
				setHasReports(match.has_reports === 1)
				setHasOnlineBooking(match.has_online_booking === 1)
				setIsPublic(match.is_public === 1)
			} else {
				setErrorMsg("Plano não encontrado.")
			}
		}
	}

	useEffect(() => {
		loadPlan()
	}, [planId])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setErrorMsg(null)
		setSuccessMsg(null)

		const body = {
			name,
			price: parseFloat(price) || 0,
			max_professionals: parseInt(maxProfessionals) || -1,
			max_customers: parseInt(maxCustomers) || -1,
			max_users: parseInt(maxUsers) || -1,
			has_loyalty: hasLoyalty ? 1 : 0,
			has_stock: hasStock ? 1 : 0,
			has_reports: hasReports ? 1 : 0,
			has_online_booking: hasOnlineBooking ? 1 : 0,
			is_public: isPublic ? 1 : 0,
		}

		let res
		if (isNew) {
			res = await http.post<Plan>("/admin/plans", body)
		} else {
			res = await http.put<Plan>(`/admin/plans/${planId}`, body)
		}

		setSaving(false)

		if (res.error) {
			setErrorMsg(res.error.message || "Erro ao salvar plano")
			return
		}

		setSuccessMsg("Plano salvo com sucesso!")
		setTimeout(() => {
			router.push("/admin/planos")
		}, 1500)
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground text-sm font-medium">Carregando plano...</span>
			</div>
		)
	}

	return (
		<div className="container max-w-3xl py-8 space-y-8 animate-in fade-in duration-300">
			<div className="flex items-center justify-between border-b pb-4">
				<div className="flex items-center gap-3">
					<Link href="/admin/planos">
						<Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
							<ArrowLeft className="h-4 w-4 mr-1" /> Voltar
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-extrabold tracking-tight">
							{isNew ? "Novo Plano de Assinatura" : `Editar Plano: ${name}`}
						</h1>
						<p className="text-muted-foreground text-sm mt-1">Configure limites, features e preços do plano.</p>
					</div>
				</div>
				<ShieldCheck className="h-10 w-10 text-primary" />
			</div>

			{successMsg && (
				<Alert variant="success">
					{successMsg}
				</Alert>
			)}

			{errorMsg && (
				<Alert variant="error">
					{errorMsg}
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Dados Principais & Precificação</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="plan-name" className="text-xs font-bold text-slate-500">Nome do Plano</label>
								<Input
									id="plan-name"
									placeholder="Ex: Profissional"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="plan-price" className="text-xs font-bold text-slate-500">Mensalidade (R$)</label>
								<Input
									id="plan-price"
									type="number"
									step="0.01"
									min="0"
									placeholder="99.00"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									required
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Limites Operacionais</CardTitle>
						<CardDescription>Defina os tetos operacionais (-1 = ilimitado).</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<label htmlFor="limit-profs" className="text-xs font-bold text-slate-500">Máx. Profissionais</label>
							<Input
								id="limit-profs"
								type="number"
								min="-1"
								value={maxProfessionals}
								onChange={(e) => setMaxProfessionals(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="limit-custs" className="text-xs font-bold text-slate-500">Máx. Clientes Base</label>
							<Input
								id="limit-custs"
								type="number"
								min="-1"
								value={maxCustomers}
								onChange={(e) => setMaxCustomers(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="limit-users" className="text-xs font-bold text-slate-500">Máx. Atendentes/Usuários</label>
							<Input
								id="limit-users"
								type="number"
								min="-1"
								value={maxUsers}
								onChange={(e) => setMaxUsers(e.target.value)}
								required
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Recursos Inclusos & Visibilidade</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between pb-3 border-b">
							<div className="space-y-0.5">
								<label className="font-semibold text-slate-700 text-sm">Agendamento Online Público</label>
								<p className="text-xs text-muted-foreground">Permite que a barbearia use o portal público para clientes agendarem.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={hasOnlineBooking}
								onClick={() => setHasOnlineBooking(!hasOnlineBooking)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
									hasOnlineBooking ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										hasOnlineBooking ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="flex items-center justify-between pb-3 border-b">
							<div className="space-y-0.5">
								<label className="font-semibold text-slate-700 text-sm">Módulo de Fidelidade</label>
								<p className="text-xs text-muted-foreground">Habilita programa de fidelidade (pontos/carimbos) para a barbearia.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={hasLoyalty}
								onClick={() => setHasLoyalty(!hasLoyalty)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
									hasLoyalty ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										hasLoyalty ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="flex items-center justify-between pb-3 border-b">
							<div className="space-y-0.5">
								<label className="font-semibold text-slate-700 text-sm">Controle de Estoque</label>
								<p className="text-xs text-muted-foreground">Libera controle de produtos e consumo de insumos.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={hasStock}
								onClick={() => setHasStock(!hasStock)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
									hasStock ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										hasStock ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="flex items-center justify-between pb-3 border-b">
							<div className="space-y-0.5">
								<label className="font-semibold text-slate-700 text-sm">Relatórios & Dashboards Avançados</label>
								<p className="text-xs text-muted-foreground">Libera painel gráfico e exportações detalhadas de faturamento e ocupação.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={hasReports}
								onClick={() => setHasReports(!hasReports)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
									hasReports ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										hasReports ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="flex items-center justify-between pt-2">
							<div className="space-y-0.5">
								<label className="font-semibold text-slate-700 text-sm">Plano Disponível para Contratação (Público)</label>
								<p className="text-xs text-muted-foreground">Exibe este plano no fluxo público de auto-cadastro da plataforma.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={isPublic}
								onClick={() => setIsPublic(!isPublic)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
									isPublic ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										isPublic ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button type="submit" size="lg" disabled={saving}>
						{saving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Salvando...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Salvar Plano
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	)
}
