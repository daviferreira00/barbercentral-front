import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BarberCentral — Acesso",
  description: "Faça login no painel administrativo do BarberCentral.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Painel de Branding (Esquerda) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex-col justify-between p-12 text-white">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="flex items-center z-10">
          <img
            src="/logo/barbercentral-logo-horizontal-white.svg"
            alt="BarberCentral"
            className="h-10 w-auto"
          />
        </div>

        <div className="z-10 max-w-lg space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Gestão e agendamento inteligente para barbearias.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            Gerencie profissionais, defina disponibilidades, acompanhe o caixa e ofereça agendamento online integrado com fidelidade e identidade visual própria.
          </p>
        </div>

        <div className="z-10 text-xs text-slate-400 font-semibold">
          &copy; {new Date().getFullYear()} BarberCentral. Todos os direitos reservados.
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
