export interface NavItem {
  href: string
  icon: string
  label: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Navegação do painel da barbearia (usada pelo drawer mobile)
export const clienteNavSections: NavSection[] = [
  {
    title: "Operacional",
    items: [
      { href: "/cliente", icon: "ti-layout-dashboard", label: "Painel Geral" },
      { href: "/cliente/agenda", icon: "ti-calendar", label: "Agenda" },
      { href: "/cliente/profissionais", icon: "ti-users", label: "Profissionais" },
      { href: "/cliente/servicos", icon: "ti-cut", label: "Serviços" },
      { href: "/cliente/clientes", icon: "ti-users-group", label: "Clientes CRM" },
    ],
  },
  {
    title: "Faturamento & Estoque",
    items: [
      { href: "/cliente/caixa", icon: "ti-cash", label: "Fluxo de Caixa" },
      { href: "/cliente/estoque", icon: "ti-box", label: "Estoque" },
      { href: "/cliente/relatorios", icon: "ti-chart-bar", label: "Relatórios" },
    ],
  },
  {
    title: "Comunicação & Alertas",
    items: [
      { href: "/cliente/chat", icon: "ti-message", label: "Chat WhatsApp" },
      { href: "/cliente/whatsapp", icon: "ti-brand-whatsapp", label: "Canais WhatsApp" },
      { href: "/cliente/notificacoes", icon: "ti-bell", label: "Notificações e Alertas" },
    ],
  },
  {
    title: "Configurações",
    items: [
      { href: "/cliente/configuracoes/agenda", icon: "ti-calendar-event", label: "Regras da Agenda" },
      { href: "/cliente/configuracoes/fidelidade", icon: "ti-award", label: "Fidelidade" },
      { href: "/cliente/configuracoes/identidade-visual", icon: "ti-palette", label: "Identidade Visual" },
      { href: "/cliente/configuracoes/plano", icon: "ti-shield-check", label: "Plano & Assinatura" },
    ],
  },
]
