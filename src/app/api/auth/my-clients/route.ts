import { bffProxy } from "@/shared/lib/bff-proxy"

// Lista as barbearias vinculadas ao usuário logado (fonte do seletor).
// Só repasse — não mexe em cookie.
export async function GET() {
  return bffProxy("/auth/my-clients", "GET")
}
