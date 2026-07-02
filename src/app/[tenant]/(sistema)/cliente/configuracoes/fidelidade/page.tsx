"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Gift, Award, Star, Loader2 } from "lucide-react"

interface LoyaltyProgram {
	id?: string
	name: string
	type: string
	stamps_to_reward?: number
	points_per_real?: number
	reward_description: string
	active: number
}

export default function LoyaltyConfigPage() {
	const [program, setProgram] = useState<LoyaltyProgram | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	// Campos do form
	const [name, setName] = useState("")
	const [type, setType] = useState("stamps") // stamps, points
	const [stampsToReward, setStampsToReward] = useState("10")
	const [pointsPerReal, setPointsPerReal] = useState("1.0")
	const [rewardDescription, setRewardDescription] = useState("")
	const [active, setActive] = useState(true)

	const loadProgram = async () => {
		setLoading(true)
		setErrorMsg(null)
		const res = await http.get<LoyaltyProgram>("/loyalty/program")
		setLoading(false)

		if (res.data) {
			setProgram(res.data)
			setName(res.data.name)
			setType(res.data.type)
			setStampsToReward(res.data.stamps_to_reward ? String(res.data.stamps_to_reward) : "10")
			setPointsPerReal(res.data.points_per_real ? String(res.data.points_per_real) : "1.0")
			setRewardDescription(res.data.reward_description)
			setActive(res.data.active === 1)
		} else {
			// Cria estado inicial vazio se não houver programa ainda
			setName("Programa de Fidelidade Barber Club")
			setType("stamps")
			setStampsToReward("10")
			setPointsPerReal("1.0")
			setRewardDescription("Corte ou barba grátis após completar os requisitos!")
			setActive(false)
		}
	}

	useEffect(() => {
		loadProgram()
	}, [])

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setSuccessMsg(null)
		setErrorMsg(null)

		const stampsNum = type === "stamps" ? parseInt(stampsToReward) : parseInt(stampsToReward) || 100
		const pointsNum = type === "points" ? parseFloat(pointsPerReal) : 0

		const body = {
			name,
			type,
			stamps_to_reward: stampsNum,
			points_per_real: pointsNum,
			reward_description: rewardDescription,
			active: active ? 1 : 0,
		}

		const res = await http.post<LoyaltyProgram>("/loyalty/program", body)
		setSaving(false)

		if (res.error) {
			if (res.error.message && res.error.message.includes("plan_feature_not_included")) {
				setErrorMsg("Seu plano atual não inclui a funcionalidade de Fidelidade. Faça upgrade para o plano Profissional ou Premium para habilitar!")
			} else {
				setErrorMsg(res.error.message || "Erro ao salvar programa de fidelidade")
			}
			return
		}

		if (res.data) {
			setProgram(res.data)
			setSuccessMsg("Programa de fidelidade configurado com sucesso!")
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground text-sm font-medium">Carregando fidelidade...</span>
			</div>
		)
	}

	return (
		<div className="container max-w-3xl py-8 space-y-8 animate-in fade-in duration-300">
			<div className="flex items-center justify-between border-b pb-4">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight">Programa de Fidelidade</h1>
					<p className="text-muted-foreground text-sm mt-1">Recompense seus clientes e aumente a retenção na sua barbearia.</p>
				</div>
				<Award className="h-10 w-10 text-primary" />
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

			<form onSubmit={handleSave} className="space-y-6">
				<Card className="border-border/45 bg-card/60 backdrop-blur-sm">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-xl">Configuração do Programa</CardTitle>
								<CardDescription>Defina as regras de acumulação de pontos ou carimbos.</CardDescription>
							</div>
							<div className="flex items-center space-x-2 bg-secondary/30 px-3 py-1.5 rounded-full border">
								<span className="text-xs font-semibold text-muted-foreground">Status do Programa:</span>
								<span className={`text-xs font-bold ${program && program.active === 1 ? 'text-green-500' : 'text-yellow-500'}`}>
									{program && program.active === 1 ? 'ATIVO' : 'INATIVO'}
								</span>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between pb-4 border-b">
							<div className="space-y-0.5">
								<label className="text-base font-semibold">Ativar Fidelidade</label>
								<p className="text-xs text-muted-foreground">Habilita ou desabilita o acúmulo automático para clientes.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={active}
								onClick={() => setActive(!active)}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
									active ? "bg-primary" : "bg-slate-200"
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${
										active ? "translate-x-5" : "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="space-y-2">
							<label htmlFor="program-name" className="text-xs font-bold text-slate-500">Nome do Programa de Fidelidade</label>
							<Input
								id="program-name"
								placeholder="Ex: Fidelidade Barber Club"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-3">
							<label className="text-xs font-bold text-slate-500">Tipo de Fidelidade</label>
							<div className="grid grid-cols-2 gap-4">
								<div
									onClick={() => setType("stamps")}
									className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
										type === "stamps"
											? "border-primary bg-primary/5 ring-1 ring-primary"
											: "border-border bg-card hover:bg-secondary/40"
									}`}
								>
									<div className={`p-2 rounded-lg ${type === "stamps" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
										<Star className="h-5 w-5" />
									</div>
									<div>
										<span className="text-sm font-bold block">Cartão Fidelidade</span>
										<span className="text-xs text-muted-foreground">Acumula 1 carimbo por visita paga.</span>
									</div>
								</div>

								<div
									onClick={() => setType("points")}
									className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
										type === "points"
											? "border-primary bg-primary/5 ring-1 ring-primary"
											: "border-border bg-card hover:bg-secondary/40"
									}`}
								>
									<div className={`p-2 rounded-lg ${type === "points" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
										<Gift className="h-5 w-5" />
									</div>
									<div>
										<span className="text-sm font-bold block">Sistema de Pontos</span>
										<span className="text-xs text-muted-foreground">Acumula pontos baseado no valor pago.</span>
									</div>
								</div>
							</div>
						</div>

						{type === "stamps" ? (
							<div className="space-y-2 p-4 rounded-xl bg-secondary/20 border">
								<label htmlFor="stamps-count" className="text-xs font-bold text-slate-500">Carimbos para Ganhar Recompensa</label>
								<Input
									id="stamps-count"
									type="number"
									min="1"
									max="100"
									value={stampsToReward}
									onChange={(e) => setStampsToReward(e.target.value)}
									required
								/>
								<span className="text-xs text-muted-foreground">Recomendado: 10 carimbos (equivalente a 10 visitas).</span>
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/20 border">
								<div className="space-y-2">
									<label htmlFor="points-per-real" className="text-xs font-bold text-slate-500">Pontos por R$ 1,00 Gasto</label>
									<Input
										id="points-per-real"
										type="number"
										step="0.1"
										min="0.1"
										value={pointsPerReal}
										onChange={(e) => setPointsPerReal(e.target.value)}
										required
									/>
									<span className="text-xs text-muted-foreground">Ex: 1 ponto por Real gasto.</span>
								</div>
								<div className="space-y-2">
									<label htmlFor="points-to-reward" className="text-xs font-bold text-slate-500">Pontos para Resgatar Prêmio</label>
									<Input
										id="points-to-reward"
										type="number"
										min="1"
										value={stampsToReward}
										onChange={(e) => setStampsToReward(e.target.value)}
										required
									/>
									<span className="text-xs text-muted-foreground">Ex: 100 pontos para resgatar.</span>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="reward-desc" className="text-xs font-bold text-slate-500">Descrição do Prêmio / Recompensa</label>
							<textarea
								id="reward-desc"
								placeholder="Ex: 1 Corte de Cabelo Grátis ou Creme Modelador de brinde!"
								value={rewardDescription}
								onChange={(e) => setRewardDescription(e.target.value)}
								required
								rows={4}
								className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
							/>
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
							"Salvar Configurações"
						)}
					</Button>
				</div>
			</form>
		</div>
	)
}
