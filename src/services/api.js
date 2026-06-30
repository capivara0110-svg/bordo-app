const API = import.meta.env.VITE_API_URL || "/api";
const OFFLINE_QUEUE_KEY = "bordo_offline_queue";

function readOfflineQueue() {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
}

function queueOfflineMutation(path, options) {
  const queue = readOfflineQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    path,
    options,
    criado_em: new Date().toISOString(),
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(-80)));
}

export async function syncOfflineQueue() {
  if (!navigator.onLine) return { synced: 0, remaining: readOfflineQueue().length };
  const queue = readOfflineQueue();
  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await request(item.path, { ...item.options, skipOfflineQueue: true });
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return { synced, remaining: remaining.length };
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineQueue().catch(() => {});
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

// ─── CLIENTE HTTP ───────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem("bordo_token");
  const { skipOfflineQueue, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    const method = String(fetchOptions.method || "GET").toUpperCase();
    if (!skipOfflineQueue && method !== "GET") {
      queueOfflineMutation(path, fetchOptions);
      return { offline: true, queued: true };
    }
    throw error;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.erro || "Erro na requisição");
  }

  return data;
}

// ─── AUTH ────────────────────────────────────────────────
export const api = {
  // Login
  login: (email, senha) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  // Registro
  registro: (nome, nomeEmpresa, email, senha) =>
    request("/auth/registro", {
      method: "POST",
      body: JSON.stringify({ nome, nome_empresa: nomeEmpresa, email, senha }),
    }),

  // Meus dados
  me: () => request("/auth/me"),

  empresa: {
    dados: () => request("/empresa"),
    membros: () => request("/empresa/membros"),
    convites: () => request("/empresa/convites"),
    criarConvite: (dados) =>
      request("/empresa/convites", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    convitePublico: (token) => request(`/empresa/convites/${token}/publico`),
    aceitarConvite: (token, dados) =>
      request(`/empresa/convites/${token}/aceitar`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    criarMembro: (dados) =>
      request("/empresa/membros", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    alterarPapel: (id, papel) =>
      request(`/empresa/membros/${id}/papel`, {
        method: "PUT",
        body: JSON.stringify({ papel }),
      }),
  },

  assinaturas: {
    checkout: (dados) =>
      request("/assinaturas/checkout", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    admin: () => request("/assinaturas/admin"),
    atualizarAdmin: (empresaId, dados) =>
      request(`/assinaturas/admin/${empresaId}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
  },

  // ─── DIÁRIO ──────────────────────────────────────────
  diario: {
    listar: () => request("/diario"),
    criar: (tipo, descricao, autor) =>
      request("/diario", {
        method: "POST",
        body: JSON.stringify({ tipo, descricao, autor }),
      }),
    assinar: (id) =>
      request(`/diario/${id}/assinar`, { method: "PUT" }),
  },

  // ─── CHECKLIST ────────────────────────────────────────
  checklist: {
    listar: () => request("/checklist"),
    toggle: (id) =>
      request(`/checklist/${id}/toggle`, { method: "PUT" }),
    criar: (categoria, item) =>
      request("/checklist", {
        method: "POST",
        body: JSON.stringify({ categoria, item }),
      }),
  },

  // ─── TRIPULAÇÃO ───────────────────────────────────────
  tripulacao: {
    listar: () => request("/tripulacao"),
    criar: (dados) =>
      request("/tripulacao", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    editar: (id, dados) =>
      request(`/tripulacao/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
  },

  // ─── ESTOQUE ──────────────────────────────────────────
  estoque: {
    listar: () => request("/estoque"),
    criar: (nome, unidade, quantidade, minimo, categoria) =>
      request("/estoque", {
        method: "POST",
        body: JSON.stringify({ nome, unidade, quantidade, minimo, categoria }),
      }),
    atualizar: (id, quantidade) =>
      request(`/estoque/${id}`, {
        method: "PUT",
        body: JSON.stringify({ quantidade }),
      }),
  },

  // ─── CADASTROS OPERACIONAIS ───────────────────────────
  clientes: {
    listar: () => request("/clientes"),
    historico: (id) => request(`/clientes/${id}/historico`),
    criar: (dados) =>
      request("/clientes", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    editar: (id, dados) =>
      request(`/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
  },

  embarcacoes: {
    listar: () => request("/embarcacoes"),
    alertas: () => request("/embarcacoes/alertas"),
    historico: (id) => request(`/embarcacoes/${id}/historico`),
    qrcode: (id) => request(`/embarcacoes/${id}/qrcode`),
    fotos: (id) => request(`/embarcacoes/${id}/fotos`),
    adicionarFoto: (id, dados) =>
      request(`/embarcacoes/${id}/fotos`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    criar: (dados) =>
      request("/embarcacoes", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    editar: (id, dados) =>
      request(`/embarcacoes/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
  },

  // ─── ORDENS DE SERVIÇO ────────────────────────────────
  ordens: {
    listar: () => request("/ordens"),
    modelos: () => request("/ordens/modelos"),
    criar: (dados) =>
      request("/ordens", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    editar: (id, dados) =>
      request(`/ordens/${id}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
    atualizarStatus: (id, status) =>
      request(`/ordens/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    criarTarefa: (id, tarefa) =>
      request(`/ordens/${id}/tarefas`, {
        method: "POST",
        body: JSON.stringify({ tarefa }),
      }),
    fotos: (id) => request(`/ordens/${id}/fotos`),
    adicionarFoto: (id, dados) =>
      request(`/ordens/${id}/fotos`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    registrarExecucao: (id, dados) =>
      request(`/ordens/${id}/execucoes`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    atualizarOrcamento: (id, dados) =>
      request(`/ordens/${id}/orcamento`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
    adicionarItemOrcamento: (id, dados) =>
      request(`/ordens/${id}/orcamento/itens`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    removerItemOrcamento: (id, itemId) =>
      request(`/ordens/${id}/orcamento/itens/${itemId}`, { method: "DELETE" }),
    aprovarOrcamento: (id, dados) =>
      request(`/ordens/${id}/orcamento/aprovacao`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    relatorio: (id) => request(`/ordens/${id}/relatorio`),
    aceitarRelatorio: (id, dados) =>
      request(`/ordens/${id}/relatorio/aceite`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    toggleTarefa: (id, tarefaId) =>
      request(`/ordens/${id}/tarefa/${tarefaId}`, { method: "PUT" }),
  },

  // ─── NOTIFICAÇÕES ─────────────────────────────────────
  notificacoes: {
    listar: () => request("/notificacoes"),
    ler: (id) => request(`/notificacoes/${id}/ler`, { method: "PUT" }),
    criar: (dados) =>
      request("/notificacoes", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
  },

  auditoria: {
    listar: () => request("/auditoria"),
  },

  monitoramento: {
    erros: () => request("/monitoramento/erros"),
  },

  // ─── BERÇOS ───────────────────────────────────────────
  bercos: {
    listar: () => request("/bercos"),
  },

  // ─── DASHBOARD ────────────────────────────────────────
  dashboard: {
    dados: () => request("/dashboard"),
    produtividade: (dias = 30) => request(`/dashboard/produtividade?dias=${dias}`),
  },

  agenda: {
    listar: () => request("/agenda"),
  },
};
