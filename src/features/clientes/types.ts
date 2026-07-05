export interface CustomerStats {
  id: string
  name: string
  phone: string
  email?: string
  cpf?: string
  birth_date?: string
  notes?: string
  total_visits: number
  total_spent: number
  last_visit?: string
  first_visit?: string
}

export interface CustomersListResponse {
  data: CustomerStats[]
  total: number
}

export const MONTHS = [
  { value: "0", label: "Filtrar por mês de aniversário" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]
