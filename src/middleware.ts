import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Captura o Host enviado pelo Apache (X-Forwarded-Host ou Host)
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""

  // Remove porta caso exista (ex: app.barbercentral.com.br:443 -> app.barbercentral.com.br)
  const hostname = host.split(":")[0].toLowerCase().trim()
  const { pathname, search } = request.nextUrl

  // Identifica se a requisição veio para o subdomínio do aplicativo (app.*)
  const isAppDomain =
    hostname.startsWith("app.") ||
    hostname === "app.barbercentral.com.br"

  // Repassa headers customizados para downstream se necessário
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-is-app-domain", isAppDomain ? "true" : "false")
  requestHeaders.set("x-current-hostname", hostname)

  // =========================================================================
  // CENÁRIO 1: Requisição para app.barbercentral.com.br (Sistema / Acesso)
  // =========================================================================
  if (isAppDomain) {
    // Quando o usuário acessa a raiz '/' de app.barbercentral.com.br
    if (pathname === "/") {
      const sessionCookie = request.cookies.get("bc_session")?.value

      // Se o usuário não tem sessão iniciada, redireciona imediatamente para a tela de Login
      if (!sessionCookie) {
        const loginUrl = new URL("/login", request.url)
        return NextResponse.redirect(loginUrl)
      }

      // Se tem sessão, deixa seguir para '/' onde o componente RootPage redireciona
      // de forma inteligente para /admin ou /cliente conforme o role do usuário
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // Qualquer outra rota dentro de app.* (/login, /cadastro, /cliente, /admin, etc.) segue normalmente
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // =========================================================================
  // CENÁRIO 2: Requisição para barbercentral.com.br (Landing Page Institucional)
  // =========================================================================

  // Em produção, se alguém acessar rotas do sistema administrativo/cliente (/cliente, /admin, /login)
  // estando no domínio barbercentral.com.br, direciona para app.barbercentral.com.br
  if (hostname.includes("barbercentral.com.br")) {
    if (pathname === "/login" || pathname === "/cadastro" || pathname.startsWith("/cliente") || pathname.startsWith("/admin")) {
      const targetUrl = new URL(`${pathname}${search}`, `https://app.barbercentral.com.br`)
      return NextResponse.redirect(targetUrl)
    }
  }

  // Acesso à raiz '/' em barbercentral.com.br renderiza a Landing Page (LP)
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Configuração do Matcher: Ignora assets estáticos, imagens, apis e uploads
export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - api (rotas BFF)
     * - _next/static (scripts estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico, manifest.webmanifest, sitemap.xml, robots.txt
     * - logos e uploads de arquivos
     * - qualquer arquivo com extensão (.png, .svg, .jpg, .webp, .css, .js)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|logo|uploads|.*\\..*).*)",
  ],
}
