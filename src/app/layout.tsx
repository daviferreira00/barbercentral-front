import type { Metadata, Viewport } from "next"
import { AppProvider } from "@/shared/context/AppContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "BarberCentral — Gestão de Barbearia",
  description: "SaaS completo de gestão e agendamento para barbearias premium.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Barber Central",
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6366f1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
