import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080") + "/api/v1"

/**
 * Encapsula a lógica de proxy entre o BFF Next.js e o backend Go.
 * Extrai a sessão (cookie httpOnly) e envia como token Bearer.
 */
export async function bffProxy(
  path: string,
  method: string = "GET",
  body: unknown = null,
  additionalHeaders: Record<string, string> = {}
) {
  const session = cookies().get("bc_session")

  // Rotas que passam direto pelo proxy sem cookie de sessão
  const isPublic = [
    "/auth/login",
    "/auth/magic-link",
    "/auth/magic-link/verify",
    "/auth/password-reset",
    "/auth/password-reset/confirm",
  ].some((p) => path.startsWith(p))

  if (!isPublic && !session?.value) {
    return NextResponse.json(
      {
        error: {
          code: "NAO_AUTENTICADO",
          message: "Sessão não encontrada.",
        },
      },
      { status: 401 }
    )
  }

  try {
    const headers: Record<string, string> = {
      "X-Frontend-Host": process.env.FRONTEND_URL || "http://localhost:3002",
      ...additionalHeaders,
    }

    if (session?.value) {
      headers["Authorization"] = `Bearer ${session.value}`
    }

    const isFormData = body instanceof FormData || (body !== null && typeof body === "object" && (body.constructor.name === "FormData" || "append" in (body as any)))

    if (body !== null && body !== undefined) {
      if (!isFormData) {
        headers["Content-Type"] = "application/json"
      }
    }

    const res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? (body as any) : JSON.stringify(body)) : undefined,
    })

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const payload = await res.json().catch(() => ({}))
    return NextResponse.json(payload, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ERRO_DE_CONEXAO",
          message: "Não foi possível conectar ao servidor backend.",
        },
      },
      { status: 502 }
    )
  }
}
