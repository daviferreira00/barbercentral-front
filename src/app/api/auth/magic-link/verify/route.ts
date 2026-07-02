import { NextResponse } from "next/server"

interface BodyData {
  token?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BodyData
  const { token } = body

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDACAO_INVALIDA",
          message: "O token é obrigatório.",
        },
      },
      { status: 400 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/magic-link/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: payload.error?.code || "TOKEN_INVALIDO",
            message: payload.error?.message || "Link de acesso inválido ou expirado.",
          },
        },
        { status: backendRes.status }
      )
    }

    const { token: sessionToken, user: backendUser } = payload.data || {}
    if (!sessionToken || !backendUser) {
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

    const response = NextResponse.json({ data: user })

    // Seta o cookie
    response.cookies.set("bc_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })

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
