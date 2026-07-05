import type { MetadataRoute } from "next"

// Manifest PWA (instalável na tela inicial). v1 com branding genérico do
// Barber Central; sem service worker — instalação exige apenas manifest + HTTPS.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barber Central",
    short_name: "BarberCentral",
    description: "Gestão e agendamento para barbearias.",
    start_url: "/cliente",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/logo/barbercentral-icon.png",
        sizes: "600x600",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/barbercentral-icon.png",
        sizes: "600x600",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
