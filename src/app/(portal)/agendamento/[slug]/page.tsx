import { redirect } from "next/navigation"
import PortalAgendamentoClient from "./PortalAgendamentoClient"

const BACKEND_URL = process.env.BACKEND_URL ? (process.env.BACKEND_URL + "/api/v1") : (process.env.BACKEND_API_URL || "http://localhost:8080/api/v1")

interface PublicClientData {
  client_id: string
  client_name: string
  client_slug: string
  logo_url?: string
  logo_central?: string
  color_primary: string
  color_secondary: string
  font_family: string
  address?: string
  neighborhood?: string
  city?: string
  state?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  timezone: string
  cancellation_policy_hours: number
  booking_requires_login: number
  min_advance_hours: number
  max_advance_days: number
  interval_between_minutes: number
  whatsapp_verification_enabled?: number
}

export default async function PortalAgendamentoPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  let config: PublicClientData | null = null
  try {
    const res = await fetch(`${BACKEND_URL}/public/${slug}`, {
      cache: "no-store",
    })
    if (!res.ok) {
      if (res.status === 404) {
        redirect(`/agendamento/${slug}/nao-encontrado`)
      }
      if (res.status === 403) {
        redirect(`/agendamento/${slug}/bloqueado`)
      }
      throw new Error("Erro ao buscar barbearia")
    }
    config = await res.json().then((r) => r.data || null)
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error // permite redirecionamento nativo do next
    }
    redirect(`/agendamento/${slug}/nao-encontrado`)
  }

  if (!config) {
    redirect(`/agendamento/${slug}/nao-encontrado`)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --bc-primary: ${config.color_primary};
            --bc-secondary: ${config.color_secondary};
            --bc-font: ${config.font_family};
          }
          body {
            font-family: var(--bc-font), sans-serif;
            background-color: #f8fafc;
          }
        `
      }} />
      <PortalAgendamentoClient config={config} />
    </>
  )
}
