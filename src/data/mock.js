import { C } from "../styles/theme.js";

// ─── TRIPULAÇÃO ────────────────────────────────────────────
export const mockCrew = [
  { name: "Rafael Silva", role: "Marinheiro de Máquinas", docs: { habilitacao: "2025-08-10", certificado: "2026-01-15" }, status: "ok", avatar: "🔧" },
  { name: "Carlos Mendes", role: "Capitão", docs: { habilitacao: "2024-12-01", certificado: "2025-11-20" }, status: "vencido", avatar: "🧑‍✈️" },
  { name: "João Ferreira", role: "Contramestre", docs: { habilitacao: "2026-03-20", certificado: "2026-06-01" }, status: "ok", avatar: "⚓" },
  { name: "Ana Costa", role: "Cozinheira de Bordo", docs: { habilitacao: "2025-07-05", certificado: "2026-02-10" }, status: "alerta", avatar: "👩‍🍳" },
];

// ─── DIÁRIO DE BORDO ────────────────────────────────────────
export const mockDiario = [
  { id: 1, date: "12/06/2026", time: "08:00", type: "Saída", description: "Zarpe do Porto de Santos. Condições do mar: bom. 4 tripulantes.", author: "Carlos Mendes", signed: true },
  { id: 2, date: "12/06/2026", time: "14:30", type: "Ocorrência", description: "Falha no gerador secundário. Acionado técnico de bordo.", author: "Rafael Silva", signed: true },
  { id: 3, date: "13/06/2026", time: "07:15", type: "Manutenção", description: "Troca de óleo motor principal. 20L óleo 15W-40.", author: "Rafael Silva", signed: false },
];

// ─── CHECKLIST ──────────────────────────────────────────────
export const mockChecklist = [
  { id: 1, category: "Segurança", item: "Coletes salva-vidas verificados", done: true },
  { id: 2, category: "Segurança", item: "Sinalizadores dentro da validade", done: true },
  { id: 3, category: "Segurança", item: "Extintor de incêndio verificado", done: false },
  { id: 4, category: "Motor", item: "Nível de óleo verificado", done: true },
  { id: 5, category: "Motor", item: "Sistema de refrigeração OK", done: true },
  { id: 6, category: "Motor", item: "Correia do alternador inspecionada", done: false },
  { id: 7, category: "Navegação", item: "Cartas náuticas atualizadas", done: true },
  { id: 8, category: "Navegação", item: "GPS e rádio VHF testados", done: true },
  { id: 9, category: "Comunicação", item: "Rádio de emergência (EPirb) ativo", done: false },
];

// ─── ESTOQUE ────────────────────────────────────────────────
export const mockEstoque = [
  { name: "Óleo Motor 15W-40", unit: "L", qty: 12, min: 20, category: "Motor" },
  { name: "Filtro de combustível", unit: "un", qty: 3, min: 2, category: "Motor" },
  { name: "Combustível diesel", unit: "L", qty: 850, min: 300, category: "Combustível" },
  { name: "Extintores reserva", unit: "un", qty: 1, min: 2, category: "Segurança" },
  { name: "Kit primeiros socorros", unit: "un", qty: 2, min: 1, category: "Segurança" },
  { name: "Água potável", unit: "L", qty: 200, min: 100, category: "Suprimentos" },
  { name: "Alimentos (rações)", unit: "dias", qty: 5, min: 3, category: "Suprimentos" },
];

// ─── ORDENS DE SERVIÇO ──────────────────────────────────────
export const mockOrdens = [
  { id: 1, codigo: "OS-2026-041", embarcacao: "Lancha Brisa Mar", cliente: "Pedro Albuquerque", tipo: "Limpeza", prioridade: "normal", status: "em_andamento", descricao: "Limpeza completa do casco, convés e cabine interna.", areas: ["Casco", "Convés", "Cabine"], responsavel: "Rafael Silva", abertura: "13/06/2026", previsao: "13/06/2026", itens: [{ tarefa: "Lavar casco com produto anti-incrustante", done: true }, { tarefa: "Limpar e polir convés", done: true }, { tarefa: "Aspirar e limpar cabine interna", done: false }, { tarefa: "Lavar compartimento do motor", done: false }], fotos: 2, observacao: "" },
  { id: 2, codigo: "OS-2026-039", embarcacao: "MV Esperança", cliente: "Marina São Paulo", tipo: "Manutenção", prioridade: "urgente", status: "aguardando", descricao: "Revisão do motor principal e troca de filtros.", areas: ["Praça de Máquinas"], responsavel: "Carlos Mendes", abertura: "12/06/2026", previsao: "14/06/2026", itens: [{ tarefa: "Trocar filtro de óleo", done: false }, { tarefa: "Trocar filtro de combustível", done: false }, { tarefa: "Verificar correias e mangueiras", done: false }, { tarefa: "Testar sistema elétrico", done: false }], fotos: 0, observacao: "" },
  { id: 3, codigo: "OS-2026-037", embarcacao: "Veleiro Nautilus", cliente: "Ana Rodrigues", tipo: "Pintura", prioridade: "normal", status: "concluida", descricao: "Pintura antifouling do casco.", areas: ["Casco"], responsavel: "Rafael Silva", abertura: "10/06/2026", previsao: "12/06/2026", itens: [{ tarefa: "Lixar superfície do casco", done: true }, { tarefa: "Aplicar primeira demão antifouling", done: true }, { tarefa: "Aplicar segunda demão antifouling", done: true }, { tarefa: "Inspeção final e fotos", done: true }], fotos: 6, observacao: "Serviço concluído com aprovação do cliente." },
  { id: 4, codigo: "OS-2026-042", embarcacao: "Veleiro Nautilus", tipo: "Manutenção", prioridade: "normal", status: "em_andamento", descricao: "Revisão elétrica completa.", areas: ["Cabine", "Praça de Máquinas"], responsavel: "Ana Costa", abertura: "13/06/2026", previsao: "14/06/2026", itens: [{ tarefa: "Verificar painel elétrico", done: true }, { tarefa: "Testar baterias", done: false }], fotos: 1, observacao: "" },
  { id: 5, codigo: "OS-2026-043", embarcacao: "MV Esperança", tipo: "Revisão", prioridade: "urgente", status: "aguardando", descricao: "Revisão geral antes da viagem.", areas: ["Motor", "Segurança"], responsavel: "—", abertura: "14/06/2026", previsao: "15/06/2026", itens: [{ tarefa: "Avaliar motor principal", done: false }, { tarefa: "Verificar sistemas de segurança", done: false }], fotos: 0, observacao: "" },
];

// ─── NOTIFICAÇÕES ───────────────────────────────────────────
export const mockNotificacoes = [
  { id: 1, type: "urgente", read: false, icon: "🔴", title: "OS Urgente — MV Esperança", body: "A OS-2026-039 foi marcada como urgente. Revisão do motor antes de zarpar amanhã.", time: "agora", action: "Ver OS", category: "os" },
  { id: 2, type: "alerta", read: false, icon: "⚠️", title: "Habilitação vencendo em 12 dias", body: "A habilitação náutica de João Ferreira vence em 25/06/2026. Renove antes de escalar.", time: "há 5 min", action: "Ver tripulante", category: "tripulacao" },
  { id: 3, type: "alerta", read: false, icon: "📦", title: "Estoque abaixo do mínimo", body: "Óleo Motor 15W-40 está com apenas 12L. Mínimo recomendado: 20L.", time: "há 1h", action: "Ver estoque", category: "estoque" },
  { id: 4, type: "info", read: false, icon: "✅", title: "OS-2026-041 concluída", body: "Rafael Silva finalizou a limpeza da Lancha Brisa Mar.", time: "há 2h", action: "Assinar OS", category: "os" },
  { id: 5, type: "info", read: true, icon: "📋", title: "Novo registro no diário", body: "Carlos Mendes registrou uma ocorrência no diário da MV Esperança.", time: "há 3h", action: "Ver registro", category: "diario" },
];

// ─── BERÇOS ──────────────────────────────────────────────────
export const mockBercos = [
  { num: "01", embarcacao: "MV Esperança", cliente: "Marina SP", status: "ocupado", entrada: "10/06", saida: "16/06" },
  { num: "02", embarcacao: "Lancha Brisa Mar", cliente: "Pedro Albuquerque", status: "ocupado", entrada: "12/06", saida: "14/06" },
  { num: "03", embarcacao: "—", cliente: "—", status: "livre", entrada: "—", saida: "—" },
  { num: "04", embarcacao: "Veleiro Nautilus", cliente: "Ana Rodrigues", status: "ocupado", entrada: "11/06", saida: "20/06" },
  { num: "05", embarcacao: "—", cliente: "—", status: "livre", entrada: "—", saida: "—" },
  { num: "06", embarcacao: "Escuna Mar Aberto", cliente: "Clube Náutico", status: "reservado", entrada: "15/06", saida: "22/06" },
  { num: "07", embarcacao: "Lancha Aurora", cliente: "Roberto Dias", status: "ocupado", entrada: "13/06", saida: "15/06" },
  { num: "08", embarcacao: "—", cliente: "—", status: "manutencao", entrada: "—", saida: "—" },
];

// ─── PERFIS ──────────────────────────────────────────────────
export const PERFIS_SISTEMA = [
  {
    id: "marinheiro",
    emoji: "🧑‍✈️",
    label: "Marinheiro / Tripulante",
    desc: "Diário de bordo, check-list de saída, escala e documentos da tripulação.",
    color: C.aqua,
    tabs: [
      { id: "diario", icon: "📋", label: "Diário" },
      { id: "checklist", icon: "✅", label: "Check-list" },
      { id: "tripulacao", icon: "👥", label: "Tripulação" },
      { id: "estoque", icon: "📦", label: "Estoque" },
    ],
    user: { name: "Carlos Mendes", role: "Capitão", vessel: "MV Esperança" },
  },
  {
    id: "marinharia",
    emoji: "🧹",
    label: "Equipe de Marinharia",
    desc: "Ordens de serviço, check-list de limpeza, fotos e relatório.",
    color: C.purple,
    tabs: [
      { id: "ordens", icon: "🔧", label: "Minhas OS" },
      { id: "checklist", icon: "✅", label: "Check-list" },
      { id: "fotos", icon: "📸", label: "Fotos" },
      { id: "relatorio", icon: "📄", label: "Relatório" },
    ],
    user: { name: "Rafael Silva", role: "Técnico de Marinharia", vessel: "Marina São Paulo" },
  },
  {
    id: "tecnico",
    emoji: "🔧",
    label: "Técnico de Manutenção",
    desc: "Ordens de serviço, controle de peças e horas trabalhadas.",
    color: C.gold,
    tabs: [
      { id: "ordens", icon: "🔧", label: "Ordens" },
      { id: "pecas", icon: "⚙️", label: "Peças" },
      { id: "horas", icon: "⏱️", label: "Horas" },
      { id: "historico", icon: "📁", label: "Histórico" },
    ],
    user: { name: "Ana Costa", role: "Mecânica Naval", vessel: "Estaleiro Litoral" },
  },
  {
    id: "gestor",
    emoji: "👔",
    label: "Gestor / Marina",
    desc: "Painel completo de gestão da marina.",
    color: C.green,
    tabs: [
      { id: "dashboard", icon: "📊", label: "Painel" },
      { id: "equipe", icon: "👥", label: "Equipe" },
      { id: "ordens", icon: "🔧", label: "Ordens" },
      { id: "bercos", icon: "⚓", label: "Berços" },
    ],
    user: { name: "Administrador", role: "Gestor", vessel: "Marina São Paulo" },
  },
];

// ─── EQUIPE (para gestor) ────────────────────────────────────
export const mockEquipe = [
  { name: "Rafael Silva", role: "Marinharia", status: "ativo", os: 2, avatar: "🧹" },
  { name: "Carlos Mendes", role: "Capitão", status: "em_viagem", os: 0, avatar: "🧑‍✈️" },
  { name: "João Ferreira", role: "Contramestre", status: "ativo", os: 1, avatar: "⚓" },
  { name: "Ana Costa", role: "Mec. Naval", status: "folga", os: 0, avatar: "🔧" },
  { name: "Lucas Pinto", role: "Marinharia", status: "ativo", os: 3, avatar: "🧹" },
  { name: "Fernanda Rocha", role: "Administrativa", status: "ativo", os: 0, avatar: "📋" },
];

// ─── RECEITA ─────────────────────────────────────────────────
export const mockReceita = [18400, 22100, 19800, 25600, 23900, 28400];
export const mockMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
