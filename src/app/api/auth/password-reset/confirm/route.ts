import { NextResponse } from "next/server"

interface BodyData {
  token?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BodyData
  const { token, password } = body

  if (!token || !password) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDACAO_INVALIDA",
          message: "Token e senha são obrigatórios.",
        },
      },
      { status: 400 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(payload, { status: backendRes.status })
    }

    return NextResponse.json({ data: { ok: true } })
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
