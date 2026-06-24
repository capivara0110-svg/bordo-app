const API = import.meta.env.VITE_API_URL || "/api";

// ─── CLIENTE HTTP ───────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem("bordo_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

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
    criar: (nome, cargo, habilitacao, certificado) =>
      request("/tripulacao", {
        method: "POST",
        body: JSON.stringify({ nome, cargo, habilitacao, certificado }),
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
    historico: (id) => request(`/embarcacoes/${id}/historico`),
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
    toggleTarefa: (id, tarefaId) =>
      request(`/ordens/${id}/tarefa/${tarefaId}`, { method: "PUT" }),
  },

  // ─── NOTIFICAÇÕES ─────────────────────────────────────
  notificacoes: {
    listar: () => request("/notificacoes"),
    ler: (id) => request(`/notificacoes/${id}/ler`, { method: "PUT" }),
  },

  // ─── BERÇOS ───────────────────────────────────────────
  bercos: {
    listar: () => request("/bercos"),
  },

  // ─── DASHBOARD ────────────────────────────────────────
  dashboard: {
    dados: () => request("/dashboard"),
  },

  agenda: {
    listar: () => request("/agenda"),
  },
};
