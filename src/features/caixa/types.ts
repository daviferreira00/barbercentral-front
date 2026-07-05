export interface CashRegister {
	id: string
	opened_by: string
	opened_at: string
	opening_balance: number
	status: string // open, closed
}

export interface CashTransaction {
	id: string
	register_id: string
	appointment_payment_id?: string
	type: string // income, expense
	amount: number
	method: string // cash, pix, card_debit, card_credit, other
	description: string
	category?: string
	created_at: string
}

export interface SummaryResponse {
	register: CashRegister
	total_income: number
	total_expense: number
	expected_balance: number
	method_totals: Record<string, number>
}

export const getMethodLabel = (m: string) => {
	switch (m) {
		case "cash": return "Dinheiro"
		case "pix": return "PIX"
		case "card_debit": return "Débito"
		case "card_credit": return "Crédito"
		default: return "Outro"
	}
}
