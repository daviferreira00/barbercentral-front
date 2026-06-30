import type { ApiResponse } from "@/shared/types/api"

const BFF_BASE = "/api"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {} } = options

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  try {
    const response = await fetch(`${BFF_BASE}${normalizedPath}`, {
      method,
      credentials: "include",
      headers: {
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body ? (body instanceof FormData ? (body as any) : JSON.stringify(body)) : undefined,
    })

    if (response.status === 204) {
      return { data: {} as T }
    }

    const text = await response.text()
    if (!text || text.trim() === "") {
      return { data: {} as T }
    }

    const payload = JSON.parse(text) as ApiResponse<T>
    return payload
  } catch (error) {
    return {
      error: {
        code: "ERRO_DE_REDE",
        message: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      },
    }
  }
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body }),
}
