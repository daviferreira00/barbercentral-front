"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { CashRegister, CashTransaction, SummaryResponse } from "../types"

// Estado e ações do fluxo de caixa (views desktop e mobile)
export function useCaixa() {
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

	return {
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
	}
}
