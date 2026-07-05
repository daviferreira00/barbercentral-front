import type { NextResponse } from "next/server"

// Mesmo cálculo usado em api/auth/login e api/admin/impersonate:
// IP e *.localhost ficam sem domain; domínios reais ganham o wildcard
// da raiz (".barbercentral.com.br") para o cookie valer no host inteiro.
export function computeCookieDomain(host: string): string | undefined {
  const hostname = host.split(":")[0]
  const isIP = /^[0-9.]+$/.test(hostname)

  if (isIP || !hostname.includes(".") || hostname.endsWith(".localhost")) {
    return undefined
  }

  const parts = hostname.split(".")
  if (parts.length >= 3 && hostname.endsWith(".com.br")) {
    return "." + parts.slice(-3).join(".")
  }
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".")
  }
  return undefined
}

export function setSessionCookie(response: NextResponse, token: string, host: string) {
  response.cookies.set("bc_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 horas
    domain: computeCookieDomain(host),
  })
}
