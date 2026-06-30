"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
	CheckCircle, 
	Lock, 
	Sparkles, 
	HelpCircle, 
	MessageSquare, 
	Loader2, 
	ShieldCheck, 
	Users, 
	Database, 
	FileBarChart 
} from "lucide-react"

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

interface UsageResponse {
	plan: Plan
	professionals: number
	customers: number
	users: number
}

export default function PlanUsagePage() {
	const [usage, setUsage] = useState<UsageResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const loadUsage = async () => {
		setLoading(true)
		setErrorMsg(null)
		const res = await http.get<UsageResponse>("/plan/usage")
		setLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message || "Erro ao carregar dados do plano")
			return
		}
		if (res.data) {
			setUsage(res.data)
		}
	}

	useEffect(() => {
		loadUsage()
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground text-sm font-medium">Carregando limites do plano...</span>
			</div>
		)
	}

	if (errorMsg || !usage) {
		return (
			<div className="container py-8">
				<Card className="border-red-200 bg-red-50 text-red-700">
					<CardContent className="p-6 text-center">
						<p className="font-bold">{errorMsg || "Erro de conexão com o servidor."}</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const { plan, professionals, customers, users } = usage

	const getProgressValue = (current: number, max: number) => {
		if (max === -1) return 0
		return Math.min((current / max) * 100, 100)
	}

	const renderLimitRow = (title: string, current: number, max: number, icon: any) => {
		const Icon = icon
		const pct = getProgressValue(current, max)
		const isUnlimited = max === -1
		const isLimitReached = !isUnlimited && current >= max

		return (
			<div className="space-y-2 p-4 rounded-xl border bg-slate-50/50">
				<div className="flex justify-between items-center text-sm">
					<div className="flex items-center gap-2 font-semibold text-slate-700">
						<Icon className="h-4 w-4 text-slate-400" />
						{title}
					</div>
					<div className="text-right font-black text-slate-800">
						{current} <span className="text-slate-400 font-normal">/ {isUnlimited ? "Ilimitado" : max}</span>
					</div>
				</div>
				{!isUnlimited && (
					<div className="w-full bg-slate-205 rounded-full h-2.5 overflow-hidden border">
						<div
							className={`h-full rounded-full transition-all duration-300 ${
								isLimitReached ? "bg-red-550" : pct > 85 ? "bg-amber-500" : "bg-primary"
							}`}
							style={{ width: `${pct}%` }}
						/>
					</div>
				)}
				{isLimitReached && (
					<p className="text-[10px] font-bold text-red-500 mt-1">Limite atingido! Faça upgrade para adicionar mais.</p>
				)}
			</div>
		)
	}

	const renderFeatureRow = (title: string, enabled: boolean) => {
		return (
			<div className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm transition hover:shadow">
				<div className="flex items-center gap-3">
					{enabled ? (
						<CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-50" />
					) : (
						<Lock className="h-5 w-5 text-slate-350" />
					)}
					<span className={`text-xs font-semibold ${enabled ? "text-slate-700 font-bold" : "text-slate-400"}`}>
						{title}
					</span>
				</div>
				{!enabled && (
					<span className="text-[9px] font-black tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase border">
						Premium
					</span>
				)}
			</div>
		)
	}

	// Número do WhatsApp para simular o Upgrade (redireciona para o WhatsApp de suporte configurado)
	const getUpgradeWhatsAppLink = () => {
		const text = encodeURIComponent(`Olá! Gostaria de falar sobre o upgrade do meu plano no BarberCentral. Minha barbearia: ${plan.name}`)
		return `https://wa.me/5511999999999?text=${text}`
	}

	return (
		<div className="container max-w-4xl py-8 space-y-8 animate-in fade-in duration-300">
			<div className="flex items-center justify-between border-b pb-4">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight">Assinatura & Plano</h1>
					<p className="text-muted-foreground text-sm mt-1">Gerencie seu plano de assinatura e acompanhe seus limites operacionais.</p>
				</div>
				<ShieldCheck className="h-10 w-10 text-primary" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Card de Faturamento/Assinatura */}
				<Card className="md:col-span-1 border-primary/20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative shadow-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
					<div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
						<Sparkles className="h-40 w-40" />
					</div>
					<CardHeader className="pb-2 border-b border-white/10">
						<span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Seu Plano Atual</span>
						<CardTitle className="text-2xl font-black text-white mt-1 uppercase">{plan.name}</CardTitle>
					</CardHeader>
					<CardContent className="py-6 flex-grow space-y-6">
						<div>
							<span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Preço Mensal</span>
							<span className="text-3xl font-black text-primary mt-1 block">
								{plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}
							</span>
						</div>

						<p className="text-xs text-white/70 leading-relaxed font-medium">
							Todos os limites são renovados e calculados em tempo real na sua base de dados BarberCentral.
						</p>
					</CardContent>
					<div className="p-6 pt-0">
						<a href={getUpgradeWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="block w-full">
							<Button size="lg" className="w-full bg-primary border-primary text-slate-900 font-bold hover:bg-primary/80">
								<MessageSquare className="h-4 w-4 mr-2" /> Upgrade do Plano
							</Button>
						</a>
					</div>
				</Card>

				{/* Cards de Uso de Recursos */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="text-xl">Limites de Recursos</CardTitle>
						<CardDescription>Acompanhe o consumo dos recursos disponíveis no seu plano.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{renderLimitRow("Profissionais Cadastrados", professionals, plan.max_professionals, Users)}
						{renderLimitRow("Clientes na Base", customers, plan.max_customers, Database)}
						{renderLimitRow("Usuários de Painel", users, plan.max_users, FileBarChart)}
					</CardContent>
				</Card>
			</div>

			{/* Recursos Habilitados vs Bloqueados */}
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Funcionalidades do Sistema</CardTitle>
					<CardDescription>Confira quais recursos estão ativos ou bloqueados pelo seu plano contratado.</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{renderFeatureRow("Portal de Auto-Agendamento Online", plan.has_online_booking === 1)}
					{renderFeatureRow("Programa de Fidelidade (Pontos/Carimbos)", plan.has_loyalty === 1)}
					{renderFeatureRow("Controle de Estoque & Consumo", plan.has_stock === 1)}
					{renderFeatureRow("Relatórios & Gráficos Financeiros", plan.has_reports === 1)}
				</CardContent>
			</Card>
		</div>
	)
}
