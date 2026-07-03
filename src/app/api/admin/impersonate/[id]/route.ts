import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const session = cookies().get("bc_session")

  if (!session?.value) {
    return NextResponse.json(
      {
        error: {
          code: "NAO_AUTENTICADO",
          message: "Sessão do administrador não encontrada.",
        },
      },
      { status: 401 }
    )
  }

  const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

  try {
    const backendRes = await fetch(`${BACKEND_URL}/admin/impersonate/${id}`, {
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
            code: payload.error?.code || "IMPERSONATE_FALHOU",
            message: payload.error?.message || "Não foi possível entrar como cliente.",
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

    const host = request.headers.get("host") || ""
    const hostname = host.split(":")[0]
    let cookieDomain = undefined
    if (hostname.includes(".")) {
      if (hostname.endsWith(".localhost")) {
        cookieDomain = undefined
      } else {
        const parts = hostname.split(".")
        if (parts.length >= 2) {
          cookieDomain = "." + parts.slice(-2).join(".")
        }
      }
    } else if (hostname === "localhost") {
      cookieDomain = undefined
    }

    // Sobrescreve o cookie com o novo token de impersonação
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
          message: "Não foi possível conectar ao servidor backend.",
        },
      },
      { status: 502 }
    )
  }
}
