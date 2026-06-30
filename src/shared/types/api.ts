export interface ApiError {
  code: string
  message: string
  details?: Array<{ field: string; message: string }>
}

export interface ApiResponse<T> {
  data?: T
  meta?: {
    page: number
    limit: number
    total: number
  }
  error?: ApiError
}
