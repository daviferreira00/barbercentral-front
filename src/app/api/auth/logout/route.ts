import { NextResponse } from "next/server"

export async function POST(request: Request) {
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

  const response = NextResponse.json({ data: { ok: true } })
  response.cookies.set("bc_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    domain: cookieDomain,
  })
  return response
}
