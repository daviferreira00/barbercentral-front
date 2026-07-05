import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BarberCentral — Acesso",
  description: "Faça login no painel administrativo do BarberCentral.",
}

// Sem subdomínio não há como saber a barbearia antes do login — a tela de
// login sempre usa a identidade visual genérica do Barber Central.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Painel de Branding (Esquerda) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="flex items-center z-10">
          <img
            src="/logo/barbercentral-logo-horizontal-white.svg"
            alt="BarberCentral"
            className="h-16 sm:h-20 max-w-[80%] object-contain"
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
      <div className="flex-1 flex flex-col justify-center items-center p-0 lg:p-12 bg-slate-50 lg:bg-transparent">
        <div className="w-full min-h-screen lg:min-h-0 lg:max-w-md bg-transparent lg:bg-white lg:border lg:border-slate-100 lg:rounded-2xl lg:shadow-xl lg:shadow-slate-100/50 p-6 lg:p-10 animate-fade-in flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}
