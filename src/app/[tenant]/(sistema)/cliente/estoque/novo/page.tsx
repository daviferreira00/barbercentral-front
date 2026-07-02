"use client"

import { useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NovoProdutoPage() {
	const router = useRouter()
	const [submitting, setSubmitting] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const [name, setName] = useState("")
	const [sku, setSku] = useState("")
	const [description, setDescription] = useState("")
	const [price, setPrice] = useState("")
	const [costPrice, setCostPrice] = useState("")
	const [quantityInStock, setQuantityInStock] = useState("0")
	const [lowStockAlert, setLowStockAlert] = useState("5")
	const [unit, setUnit] = useState("un")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name || !unit) {
			setErrorMsg("Nome e Unidade de Medida são obrigatórios.")
			return
		}

		setSubmitting(true)
		setErrorMsg(null)

		const res = await http.post("/products", {
			name,
			sku: sku ? sku : null,
			description: description ? description : null,
			price: parseFloat(price) || 0,
			cost_price: parseFloat(costPrice) || 0,
			quantity_in_stock: parseFloat(quantityInStock) || 0,
			low_stock_alert: parseFloat(lowStockAlert) || 0,
			unit,
		})
		setSubmitting(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		router.push("/cliente/estoque")
	}

	return (
		<div className="space-y-6 max-w-2xl mx-auto w-full animate-fade-in">
			{/* Topo */}
			<div className="flex items-center gap-3">
				<Link href="/cliente/estoque">
					<Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
						<i className="ti ti-arrow-left text-sm mr-1" /> Voltar
					</Button>
				</Link>
				<div>
					<h1 className="text-xl font-bold text-slate-800">Novo Produto</h1>
					<p className="text-xs text-slate-500 mt-0.5">Cadastre um novo item no estoque com quantidade inicial e preço.</p>
				</div>
			</div>

			{errorMsg && <Alert variant="error" message={errorMsg} />}

			<Card>
				<CardContent className="p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto</label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Ex: Cera modeladora Efeito Seco"
									required
								/>
							</div>

							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">SKU / Código do Produto</label>
								<Input
									value={sku}
									onChange={(e) => setSku(e.target.value)}
									placeholder="Ex: CERA-MATTE-01"
								/>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-1.5 col-span-3 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
								<Input
									value={unit}
									onChange={(e) => setUnit(e.target.value)}
									placeholder="Ex: un, ml, g, kg"
									required
								/>
							</div>

							<div className="space-y-1.5 col-span-3 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Estoque Inicial</label>
								<Input
									type="number"
									step="0.001"
									value={quantityInStock}
									onChange={(e) => setQuantityInStock(e.target.value)}
									placeholder="0.000"
								/>
							</div>

							<div className="space-y-1.5 col-span-3 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Alerta Estoque Baixo</label>
								<Input
									type="number"
									step="0.001"
									value={lowStockAlert}
									onChange={(e) => setLowStockAlert(e.target.value)}
									placeholder="5.000"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Preço de Venda (R$)</label>
								<Input
									type="number"
									step="0.01"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="0.00"
								/>
							</div>

							<div className="space-y-1.5 col-span-2 sm:col-span-1">
								<label className="text-xs font-bold text-slate-500 uppercase">Preço de Custo (R$)</label>
								<Input
									type="number"
									step="0.01"
									value={costPrice}
									onChange={(e) => setCostPrice(e.target.value)}
									placeholder="0.00"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-bold text-slate-500 uppercase">Descrição do Produto (Opcional)</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Descreva a finalidade ou observações do produto..."
								className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow duration-100"
							/>
						</div>

						<div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
							<Link href="/cliente/estoque">
								<Button type="button" variant="ghost" className="border border-slate-200 bg-white font-semibold">
									Cancelar
								</Button>
							</Link>
							<Button type="submit" disabled={submitting} className="font-semibold">
								{submitting ? "Cadastrando..." : "Cadastrar Produto"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
