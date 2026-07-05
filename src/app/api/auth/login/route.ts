import { NextResponse } from "next/server"

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDACAO_INVALIDA",
          message: "E-mail e senha são obrigatórios.",
        },
      },
      { status: 400 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const payload = await backendRes.json().catch(() => ({}))

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: {
            code: payload.error?.code || "CREDENCIAIS_INVALIDAS",
            message: payload.error?.message || "E-mail ou senha incorretos.",
          },
        },
        { status: backendRes.status }
      )
    }

    const { token, user: backendUser } = payload.data || {}
    if (!token || !backendUser) {
      return NextResponse.json(
        {
          error: {
            code: "RESPOSTA_INVALIDA",
            message: "Resposta inválida do servidor de autenticação.",
          },
        },
        { status: 502 }
      )
    }

    // Sem subdomínio não há mais tenant-da-URL para validar contra o client_id
    // retornado — a barbearia ativa (se houver só uma) já vem resolvida pelo
    // backend; com 2+ vínculos, client_id/role vêm vazios e o frontend força
    // o seletor de barbearia antes de liberar o painel.
    const user = {
      id: backendUser.id,
      client_id: backendUser.client_id,
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
    }

    const response = NextResponse.json({ data: user })

    const host = request.headers.get("host") || ""
    const hostname = host.split(":")[0]
    const isIP = /^[0-9.]+$/.test(hostname)
    let cookieDomain = undefined

    if (isIP) {
      cookieDomain = undefined
    } else if (hostname.includes(".")) {
      if (hostname.endsWith(".localhost")) {
        cookieDomain = undefined
      } else {
        const parts = hostname.split(".")
        if (parts.length >= 3 && hostname.endsWith(".com.br")) {
          cookieDomain = "." + parts.slice(-3).join(".")
        } else if (parts.length >= 2) {
          cookieDomain = "." + parts.slice(-2).join(".")
        }
      }
    }

    // Sessão em cookie httpOnly
    response.cookies.set("bc_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 horas
      domain: cookieDomain,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ERRO_DE_CONEXAO",
          message: "Não foi possível conectar ao servidor backend de autenticação.",
        },
      },
      { status: 502 }
    )
  }
}
