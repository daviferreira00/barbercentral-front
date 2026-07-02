import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BarberCentral — Acesso",
  description: "Faça login no painel administrativo do BarberCentral.",
}

interface TenantData {
  client_id: string;
  client_name: string;
  logo_url?: string;
  logo_central?: string;
  color_primary: string;
  color_secondary: string;
  background_type?: string;
}

async function getTenantData(tenant: string): Promise<TenantData | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/public/${tenant}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const tenantData = await getTenantData(params.tenant)
  const isCustomTenant = tenantData && params.tenant !== "barbercentral" && params.tenant !== "barbearia-modelo"

  const bgStyle = isCustomTenant 
    ? (tenantData.background_type === "solid_primary" ? { backgroundColor: tenantData.color_primary } 
       : tenantData.background_type === "solid_light" ? { backgroundColor: "#f8fafc" }
       : tenantData.background_type === "solid_dark" ? { backgroundColor: "#0f172a" }
       : { backgroundImage: `linear-gradient(to top right, ${tenantData.color_primary}, ${tenantData.color_secondary})` })
    : undefined // Use default tailwind classes if no custom tenant

  const logoImg = isCustomTenant && (tenantData.logo_central || tenantData.logo_url)
    ? (tenantData.logo_central || tenantData.logo_url)
    : "/logo/barbercentral-logo-horizontal-white.svg"

  const titleText = isCustomTenant
    ? `Bem-vindo(a) à ${tenantData.client_name}`
    : "Gestão e agendamento inteligente para barbearias."

  const descText = isCustomTenant
    ? "Acesse sua conta para agendar e gerenciar seus serviços."
    : "Gerencie profissionais, defina disponibilidades, acompanhe o caixa e ofereça agendamento online integrado com fidelidade e identidade visual própria."

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Painel de Branding (Esquerda) */}
      <div 
        className={`hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white ${!isCustomTenant ? "bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950" : ""}`}
        style={bgStyle}
      >
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="flex items-center z-10">
          <img
            src={logoImg}
            alt={isCustomTenant ? tenantData.client_name : "BarberCentral"}
            className="h-16 sm:h-20 max-w-[80%] object-contain"
          />
        </div>

        <div className="z-10 max-w-lg space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {titleText}
          </h1>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            {descText}
          </p>
        </div>

        <div className="z-10 text-xs text-slate-400 font-semibold">
          &copy; {new Date().getFullYear()} {isCustomTenant ? tenantData.client_name : "BarberCentral"}. Todos os direitos reservados.
        </div>
      </div>

      {/* Painel do Formulário (Direita) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 p-8 sm:p-10 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  )
}
