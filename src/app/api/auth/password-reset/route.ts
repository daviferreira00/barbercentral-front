import { NextResponse } from "next/server"

interface BodyData {
  email?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BodyData
  const { email } = body

  if (!email) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDACAO_INVALIDA",
          message: "O e-mail é obrigatório.",
        },
      },
      { status: 400 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080/api/v1"

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frontend-Host": process.env.FRONTEND_URL || "http://localhost:3000",
      },
      body: JSON.stringify({ email }),
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
