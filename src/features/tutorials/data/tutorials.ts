export interface TutorialStep {
  number: number
  title: string
  description: string
  tip?: string
}

export interface TutorialModule {
  id: string
  title: string
  badge: string
  description: string
  steps: TutorialStep[]
  actionRoute?: string
  actionLabel?: string
}

export const TUTORIALS_DATA: Record<string, TutorialModule> = {
  agenda: {
    id: "agenda",
    title: "Agenda de Atendimentos",
    badge: "Módulo Principal",
    description: "Gerencie o fluxo completo da equipe, evite choque de horários e acompanhe os atendimentos em tempo real.",
    actionRoute: "/cliente/agenda",
    actionLabel: "Ir para a Agenda",
    steps: [
      {
        number: 1,
        title: "Criar um novo agendamento",
        description: "Clique no botão '+ Novo Agendamento' no topo da tela ou clique diretamente em um horário livre na grade do profissional desejado.",
        tip: "Dica: Você também pode arrastar ou remarcar horários rapidamente pela própria grade de atendimento.",
      },
      {
        number: 2,
        title: "Selecionar cliente, profissional e serviços",
        description: "Busque pelo nome ou telefone do cliente, escolha o profissional responsável e marque os serviços executados. O valor total e o tempo de duração serão calculados automaticamente.",
      },
      {
        number: 3,
        title: "Acompanhar o status em tempo real",
        description: "Altere o status do agendamento à medida que o cliente é atendido (Agendado, Confirmado, Em Atendimento, Concluído ou Cancelado).",
      },
      {
        number: 4,
        title: "Finalizar o atendimento e mandar para o Caixa",
        description: "Ao terminar o corte ou serviço, clique no card do agendamento e selecione 'Ir para o Caixa' para registrar a forma de pagamento (PIX, Cartão ou Dinheiro) e encerrar o atendimento.",
      },
    ],
  },
  caixa: {
    id: "caixa",
    title: "Caixa e Controle Financeiro",
    badge: "Financeiro",
    description: "Controle todas as movimentações do dia, registre vendas avulsas, lançamentos de caixa e feche o expediente com precisão.",
    actionRoute: "/cliente/caixa",
    actionLabel: "Abrir Caixa Agora",
    steps: [
      {
        number: 1,
        title: "Abrir o Caixa no início do expediente",
        description: "No primeiro acesso do dia, clique no botão 'Abrir Caixa' e informe o valor inicial em dinheiro disponível na gaveta para troco.",
      },
      {
        number: 2,
        title: "Lançamento automático via Agenda",
        description: "Sempre que um atendimento for enviado para o caixa pela agenda, a comanda aparecerá pronta para recebimento com os itens e valores preenchidos.",
      },
      {
        number: 3,
        title: "Registrar vendas de produtos e saídas (Sangrias)",
        description: "Lance produtos de balcão (pomadas, cervejas) diretamente no caixa e registre sangrias (retiradas de valores) ou suprimentos (entradas) com a devida justificativa.",
      },
      {
        number: 4,
        title: "Conferir e fechar o caixa no fim do dia",
        description: "Clique em 'Fechar Caixa' ao encerrar o expediente. O sistema apresentará o resumo dividido por Dinheiro, PIX e Cartões para bater com sua gaveta.",
      },
    ],
  },
  profissionais: {
    id: "profissionais",
    title: "Equipe e Barbeiros",
    badge: "Gestão de Equipe",
    description: "Organize sua equipe, defina comissões personalizadas, jornadas de trabalho e permissões de acesso.",
    actionRoute: "/cliente/profissionais",
    actionLabel: "Gerenciar Equipe",
    steps: [
      {
        number: 1,
        title: "Cadastrar novos integrantes da equipe",
        description: "Acesse a aba 'Equipe', clique em '+ Novo Profissional' e preencha os dados de contato, foto de perfil e cargo.",
      },
      {
        number: 2,
        title: "Configurar regras de comissão",
        description: "Defina a porcentagem de comissão padrão do profissional sobre serviços e a comissão sobre vendas de produtos no balcão.",
      },
      {
        number: 3,
        title: "Vincular serviços autorizados",
        description: "Selecione quais serviços da barbearia este profissional está capacitado a executar para que apareça como opção na hora de agendar.",
      },
      {
        number: 4,
        title: "Ajustar jornada de trabalho e folgas",
        description: "Configure os horários de início e término do expediente, intervalo de almoço e dias da semana em que o profissional trabalha.",
      },
    ],
  },
  servicos: {
    id: "servicos",
    title: "Serviços e Categorias",
    badge: "Catálogo",
    description: "Estruture o catálogo de serviços da barbearia com valores, durações e regras de agendamento online.",
    actionRoute: "/cliente/servicos",
    actionLabel: "Gerenciar Serviços",
    steps: [
      {
        number: 1,
        title: "Cadastrar serviços no catálogo",
        description: "Clique em '+ Novo Serviço', informe o nome (ex: Corte + Barboterapia), preço de venda e a duração estimada em minutos.",
      },
      {
        number: 2,
        title: "Habilitar agendamento online",
        description: "Marque a opção 'Disponível para agendamento online' caso queira que o próprio cliente possa agendar esse serviço pelo link público da barbearia.",
      },
      {
        number: 3,
        title: "Organizar em categorias temáticas",
        description: "Crie categorias como 'Cabelo', 'Barba', 'Tratamentos' ou 'Combos' para manter seu catálogo limpo e fácil de navegar.",
      },
      {
        number: 4,
        title: "Vincular profissionais habilitados",
        description: "Selecione quais profissionais da barbearia realizam esse serviço específico.",
      },
    ],
  },
  whatsapp: {
    id: "whatsapp",
    title: "Lembretes Automáticos via WhatsApp",
    badge: "Automação",
    description: "Reduza faltas e esquecimentos enviando confirmações instantâneas e lembretes automáticos por WhatsApp.",
    actionRoute: "/cliente/whatsapp",
    actionLabel: "Conectar WhatsApp",
    steps: [
      {
        number: 1,
        title: "Conectar seu WhatsApp via QR Code",
        description: "Acesse o menu WhatsApp e escaneie o QR Code com a câmera do celular através do aplicativo do WhatsApp da barbearia.",
      },
      {
        number: 2,
        title: "Ativar as réguas de disparo",
        description: "Habilite o envio automático de 'Confirmação Imediata ao Agendar', 'Lembrete (ex: 2h antes)' e 'Agradecimento após o Atendimento'.",
      },
      {
        number: 3,
        title: "Personalizar o texto das mensagens",
        description: "Modifique os modelos de mensagem e use variáveis automáticas como {cliente}, {barbeiro}, {data_hora} e {link_cancelamento}.",
      },
      {
        number: 4,
        title: "Disparar lembretes manuais a qualquer momento",
        description: "Na própria tela de Agenda, clique no card do atendimento para enviar uma mensagem direta ou lembrete de confirmação via WhatsApp em um clique.",
      },
    ],
  },
  fidelidade: {
    id: "fidelidade",
    title: "Programa de Fidelidade",
    badge: "Fidelização",
    description: "Recompense seus clientes mais assíduos e aumente a taxa de retorno à barbearia.",
    actionRoute: "/cliente/configuracoes/fidelidade",
    actionLabel: "Configurar Fidelidade",
    steps: [
      {
        number: 1,
        title: "Definir a regra de acúmulo de pontos",
        description: "Defina como o cliente pontua: por exemplo, 1 ponto a cada R$ 1,00 em compras ou 1 selo/carimbo a cada visita realizada.",
      },
      {
        number: 2,
        title: "Cadastrar a recompensa de resgate",
        description: "Crie o prêmio de fidelidade (ex: 10 cortes = 1 Barba Grátis ou R$ 30 de desconto no próximo serviço).",
      },
      {
        number: 3,
        title: "Pontuação automática no Caixa",
        description: "Ao finalizar e receber qualquer comanda no Caixa, os pontos são creditados automaticamente no cadastro do cliente.",
      },
      {
        number: 4,
        title: "Resgatar prêmios com facilidade",
        description: "Quando o cliente atinge a meta, o Caixa exibirá um alerta destacado informando que ele tem um prêmio disponível para resgate.",
      },
    ],
  },
  estoque: {
    id: "estoque",
    title: "Controle de Estoque & Produtos",
    badge: "Produtos & Suprimentos",
    description: "Gerencie o estoque de insumos de uso interno e produtos de venda no balcão da barbearia.",
    actionRoute: "/cliente/estoque",
    actionLabel: "Ver Estoque",
    steps: [
      {
        number: 1,
        title: "Cadastrar produtos e insumos",
        description: "Cadastre pomadas, shampoos, lâminas e bebidas informando preço de custo, preço de venda e quantidade atual em estoque.",
      },
      {
        number: 2,
        title: "Definir limite de estoque mínimo",
        description: "Configure uma quantidade mínima de segurança para que o sistema emita alertas automáticos quando o produto estiver acabando.",
      },
      {
        number: 3,
        title: "Baixa automática de vendas no Caixa",
        description: "Ao adicionar um produto na comanda do cliente no caixa, o sistema deduz o item do estoque em tempo real.",
      },
      {
        number: 4,
        title: "Histórico e relatórios de movimentação",
        description: "Acompanhe relatórios de entradas de mercadoria, saídas por uso interno, perda ou ajuste de inventário.",
      },
    ],
  },
}

