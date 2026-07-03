import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const host = request.headers.get("host") || ""
  const hostname = host.split(":")[0]
  let cookieDomain = undefined
  if (hostname.includes(".")) {
    if (hostname.endsWith(".localhost")) {
      cookieDomain = ".localhost"
    } else {
      const parts = hostname.split(".")
      if (parts.length >= 2) {
        cookieDomain = "." + parts.slice(-2).join(".")
      }
    }
  } else if (hostname === "localhost") {
    cookieDomain = ".localhost"
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
