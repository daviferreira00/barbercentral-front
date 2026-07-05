export interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  price: number
  cost_price: number
  quantity_in_stock: number
  low_stock_alert: number
  unit: string
  active: number
}

export interface ProductListResponse {
  data: Product[]
  total: number
}
