export interface Service {
  id: string
  category_id?: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  active: number
}

export interface ServiceCategory {
  id: string
  name: string
}
