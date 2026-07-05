import { cookies } from "next/headers"
import SistemaLayoutClient from "./SistemaLayoutClient"

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080") + "/api/v1"

async function getBranding() {
  const session = cookies().get("bc_session")
  if (!session?.value) return null

  try {
    const res = await fetch(`${BACKEND_URL}/config/branding`, {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store", // nunca cachear: branding é resolvido pela sessão do usuário
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

export default async function SistemaLayout({ children }: { children: React.ReactNode }) {
  const tenantData = await getBranding()

  const customStyles = {
    "--color-primary": tenantData?.color_primary || "#6366f1",
    "--color-secondary": tenantData?.color_secondary || "#d97706",
    "--color-button": tenantData?.color_button || tenantData?.color_primary || "#6366f1",
    "--font-family": tenantData?.font_family || "Montserrat",
  } as React.CSSProperties

  return (
    <div style={customStyles}>
      <SistemaLayoutClient tenantData={tenantData}>{children}</SistemaLayoutClient>
    </div>
  )
}
