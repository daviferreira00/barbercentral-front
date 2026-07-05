"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { CashTransaction } from "../types"

export interface HistoricoCashRegister {
	id: string
	opened_by: string
	opened_at: string
	closed_by?: string
	closed_at?: string
	opening_balance: number
	closing_balance?: number
	notes?: string
	status: string // open, closed
}

interface RegisterListResponse {
	data: HistoricoCashRegister[]
	total: number
}

// Estado e ações do histórico de caixas (views desktop e mobile)
export function useCaixaHistorico() {
	const [registers, setRegisters] = useState<HistoricoCashRegister[]>([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const pageSize = 10

	const [loading, setLoading] = useState(true)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	// Detail Modal
	const [selectedReg, setSelectedReg] = useState<HistoricoCashRegister | null>(null)
	const [transactions, setTransactions] = useState<CashTransaction[]>([])
	const [loadingTxs, setLoadingTxs] = useState(false)

	const loadRegisters = async () => {
		setLoading(true)
		setErrorMsg(null)
		const res = await http.get<RegisterListResponse>(`/cash-registers?page=${page}&page_size=${pageSize}`)
		setLoading(false)

		if (res.error) {
			setErrorMsg(res.error.message)
			return
		}

		if (res.data) {
			setRegisters(res.data.data || [])
			setTotal(res.data.total || 0)
		}
	}

	useEffect(() => {
		loadRegisters()
	}, [page])

	// Fetch transactions when selecting a register
	useEffect(() => {
		if (selectedReg) {
			setLoadingTxs(true)
			http.get<CashTransaction[]>(`/cash-registers/${selectedReg.id}/transactions`).then((res) => {
				setLoadingTxs(false)
				if (res.data) setTransactions(res.data)
			})
		} else {
			setTransactions([])
		}
	}, [selectedReg])

	const totalPages = Math.ceil(total / pageSize)

	return {
		registers,
		total,
		totalPages,
		page,
		setPage,
		loading,
		errorMsg,
		selectedReg,
		setSelectedReg,
		transactions,
		loadingTxs,
	}
}
