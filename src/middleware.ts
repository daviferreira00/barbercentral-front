import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest (metadata files)
     */
    '/((?!api|uploads|_next/static|_next/image|logo|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Pega o hostname da requisição (ex: wbrothers.localhost:3000, wbrothers.seusaas.com)
  let hostname = req.headers.get('host') || '';

  // Remove a porta (comum no ambiente de desenvolvimento local)
  hostname = hostname.split(':')[0];

  // Domínios principais da sua aplicação (SaaS). 
  // Qualquer coisa antes disso será tratado como subdomínio (tenant).
  const mainDomains = ['localhost', 'seusaas.com', 'barbercentral.com.br'];
  
  let tenant = hostname;

  // Tenta extrair o subdomínio se estiver usando um domínio principal
  for (const domain of mainDomains) {
    if (hostname.endsWith(`.${domain}`)) {
       tenant = hostname.replace(`.${domain}`, '');
       break;
    }
  }
  
  // Opcional: Se acessar apenas "localhost" sem subdomínio, podemos redirecionar ou reescrever para uma landing page do SaaS.
  // Por enquanto, vamos reescrever para a pasta do tenant de qualquer forma.
  if (tenant === 'localhost') {
    // Pode ser um valor default para dev, ou a rota principal do seu SaaS.
    tenant = 'barbearia-modelo'; // Apenas para facilitar testes locais iniciais se o dev esquecer o subdomínio
  }

  // Faz o rewrite invisível para /[tenant]/path
  // Ex: wbrothers.localhost:3000/admin -> /[tenant]/admin
  return NextResponse.rewrite(new URL(`/${tenant}${url.pathname}${url.search}`, req.url));
}
