import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
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

  const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080/api/v1"

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.value}`,
      },
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: payload.error?.code || "NAO_AUTENTICADO",
            message: payload.error?.message || "Sessão expirada ou inválida.",
          },
        },
        { status: backendRes.status }
      )
    }

    const { user: backendUser } = payload.data || {}
    if (!backendUser) {
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

    const user = {
      id: backendUser.id,
      client_id: backendUser.client_id,
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
    }

    return NextResponse.json({ data: user })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ERRO_DE_CONEXAO",
          message: "Não foi possível verificar a sessão no servidor backend.",
        },
      },
      { status: 502 }
    )
  }
}
