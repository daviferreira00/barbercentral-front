import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { setSessionCookie } from "@/shared/lib/session-cookie"

interface SwitchClientBody {
  client_id?: string
}

// Troca a barbearia ativa de um usuário com múltiplos vínculos: o backend
// reemite o JWT com o novo client_id e o cookie httpOnly é sobrescrito aqui
// (não dá para fazer client-side).
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

  const body = (await request.json().catch(() => ({}))) as SwitchClientBody
  if (!body.client_id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDACAO_INVALIDA",
          message: "O client_id é obrigatório.",
        },
      },
      { status: 400 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/switch-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.value}`,
      },
      body: JSON.stringify({ client_id: body.client_id }),
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: payload.error?.code || "TROCA_FALHOU",
            message: payload.error?.message || "Não foi possível trocar de barbearia.",
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
