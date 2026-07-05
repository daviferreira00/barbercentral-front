import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { setSessionCookie } from "@/shared/lib/session-cookie"

// Admin impersonando volta para a sessão admin limpa: o backend valida o
// original_admin_id do token atual, reemite um JWT de admin e o cookie
// httpOnly é sobrescrito aqui.
export async function POST(request: Request) {
  const session = cookies().get("bc_session")

  if (!session?.value) {
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

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/return-to-admin`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.value}`,
      },
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: payload.error?.code || "RETORNO_FALHOU",
            message: payload.error?.message || "Não foi possível voltar para o painel admin.",
          },
        },
        { status: backendRes.status }
      )
    }

    const { token } = payload.data || {}
    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: "RESPOSTA_INVALIDA",
            message: "Resposta inválida do servidor backend.",
          },
        },
        { status: 502 }
      )
    }

    const response = NextResponse.json({ data: { ok: true } })
    setSessionCookie(response, token, request.headers.get("host") || "")
    return response
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
