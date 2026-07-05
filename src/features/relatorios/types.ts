export interface RevenueReport {
  total_revenue: number
  average_ticket: number
  total_payments: number
  daily_revenue: { label: string; value: number }[]
  professional_revenue: { label: string; count: number; value: number }[]
  service_revenue: { label: string; count: number; value: number }[]
  method_revenue: { label: string; value: number }[]
}

export interface OccupancyReport {
  occupancy_rate: number
  weekday_heatmap: { weekday: number; hour: number; count: number }[]
  professional_hours: { label: string; hours_allowed: number; hours_booked: number; percent: number; count: number }[]
}

export interface CustomerReport {
  total_customers: number
  new_customers: number
  returning_customers: number
  return_rate: number
  top_customers: { label: string; count: number; value: number; date?: string }[]
  churn_customers: { label: string; count: number; value: number; date?: string }[]
}

export interface CancellationReport {
  total_appointments: number
  cancellations: number
  no_shows: number
  cancellation_rate: number
  professional_cancellations: { label: string; count: number }[]
  recent_cancellations: { date: string; time: string; professional: string; customer?: string; reason?: string }[]
}
