"use client"

import { Calendar, MessageSquare, Monitor, DollarSign, Award, Package, ArrowUpRight } from "lucide-react"

export function FeatureGrid() {
  const features = [
    {
      icon: Calendar,
      tag: "AGENDAMENTO 24/7",
      title: "Página Pública Exclusiva da Barbearia",
      description: "Seu link personalizado para a bio do Instagram e WhatsApp. O cliente escolhe barbeiro, serviço e horário sem você precisar responder uma mensagem.",
      highlight: "barbercentral.com.br/agendamento/sua-barbearia",
    },
    {
      icon: MessageSquare,
      tag: "ANTI-FALTAS",
      title: "Confirmação e Lembretes via WhatsApp",
      description: "Disparo automático de lembretes no WhatsApp 2 horas antes do horário. O cliente confirma com um clique e você zera os horários vagos por esquecimento.",
      highlight: "-80% de no-show comprovado",
    },
    {
      icon: Monitor,
      tag: "FILA KDS EM TEMPO REAL",
      title: "Painel de Atendimento para TV e Recepção",
      description: "Tela dedicada para TV da sala de espera ou tablet da recepção. Barbeiros e clientes acompanham a ordem de corte sem desorganização.",
      highlight: "Experiência de barbearia premium",
    },
    {
      icon: DollarSign,
      tag: "FINANCEIRO AUTOMÁTICO",
      title: "Controle de Caixa e Comissões por Barbeiro",
      description: "Chega de fechar contas em caderninho. O sistema calcula a comissão de cada barbeiro na hora e gera o relatório diário de faturamento com 1 clique.",
      highlight: "Divisão de comissões 100% automatizada",
    },
    {
      icon: Award,
      tag: "RETENÇÃO",
      title: "Cartão de Fidelidade Digital",
      description: "Crie campanhas de fidelidade (ex: 10 cortes = 1 corte grátis). O cliente acumula selos digitais e você garante que ele volte sempre à sua barbearia.",
      highlight: "+35% de taxa de retorno mensal",
    },
    {
      icon: Package,
      tag: "ESTOQUE INTEGRADO",
      title: "Controle de Produtos e Vendas no Balcão",
      description: "Venda pomadas, óleos para barba e bebidas na mesma comanda do corte. Baixa automática e alerta de produtos acabando.",
      highlight: "Aumento do ticket médio por cliente",
    },
  ]

  return (
    <section id="recursos" className="py-20 lg:py-28 relative">
      {/* Background sutil */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#E4C56B]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#E4C56B]">
              Tudo o que sua barbearia precisa
            </span>
            <span className="h-px w-6 bg-[#E4C56B]" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ferramentas pensadas para quem vive de barbearia
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Elimine a dor de cabeça da administração. Foque no que você faz de melhor enquanto o BarberCentral cuida da agenda, do caixa e dos clientes.
          </p>
        </div>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="group relative rounded-3xl border border-white/5 bg-[#111C38]/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#E4C56B]/40 hover:bg-[#111C38]/90 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(13,23,46,0.6)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4C56B]/10 border border-[#E4C56B]/20 text-[#E4C56B] group-hover:scale-110 group-hover:bg-[#E4C56B] group-hover:text-slate-950 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#E4C56B] bg-[#E4C56B]/10 px-2.5 py-1 rounded-full border border-[#E4C56B]/20">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#E4C56B] transition-colors mb-3">
                    {f.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                    {f.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="truncate text-slate-400 font-mono text-[11px]">{f.highlight}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#E4C56B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
