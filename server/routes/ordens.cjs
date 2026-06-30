const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");
const { requirePlanoAtivo, requireLimite } = require("../planos.cjs");
const { audit } = require("../audit.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico", "marinharia"],
});
const allowedStatus = ["aguardando", "em_andamento", "concluida", "cancelada"];
const allowedPriorities = ["baixa", "media", "normal", "alta", "urgente"];
const allowedPhotoCategories = ["geral", "antes", "durante", "depois", "documento"];
const allowedBudgetStatus = ["rascunho", "enviado", "aprovado", "recusado"];
const allowedBudgetItemTypes = ["servico", "material", "hora", "mao_obra", "outro"];
const serviceTemplates = {
  limpeza: {
    label: "Limpeza",
    tipo: "Limpeza",
    tarefas: ["Registrar fotos antes", "Lavar casco e conves", "Limpar cabine", "Revisar acabamento", "Registrar fotos depois"],
  },
  motor: {
    label: "Motor",
    tipo: "Motor",
    tarefas: ["Diagnostico inicial", "Verificar oleo e filtros", "Verificar correias e mangueiras", "Testar funcionamento", "Registrar recomendacoes"],
  },
  polimento: {
    label: "Polimento",
    tipo: "Polimento",
    tarefas: ["Isolar areas sensiveis", "Lavar superficie", "Aplicar composto", "Polir acabamento", "Fotos antes/depois"],
  },
  marinharia: {
    label: "Marinharia",
    tipo: "Marinharia",
    tarefas: ["Inspecionar deck e ferragens", "Checar cabos e defensas", "Ajustar itens soltos", "Registrar pendencias"],
  },
  eletrica: {
    label: "Eletrica",
    tipo: "Eletrica",
    tarefas: ["Desligar alimentacao", "Inspecionar painel", "Testar baterias", "Testar circuitos", "Registrar medicoes"],
  },
  fibra: {
    label: "Fibra",
    tipo: "Fibra",
    tarefas: ["Mapear area danificada", "Preparar superficie", "Aplicar reparo", "Lixar e nivelar", "Registrar acabamento final"],
  },
};

function hasFullOrderAccess(usuario) {
  return ["proprietario", "gestor"].includes(usuario.papel) || usuario.perfil === "gestor";
}

async function getUsuarioMembro(usuario) {
  return db.prepare(
    `SELECT id, nome, funcao, cargo
     FROM tripulacao
     WHERE empresa_id = ? AND lower(nome) = lower(?)
     ORDER BY id
     LIMIT 1`,
  ).get(usuario.empresa_id, usuario.nome);
}

async function usuarioPodeVerOrdem(order, usuario) {
  if (!usuario || hasFullOrderAccess(usuario)) return true;

  const membro = await getUsuarioMembro(usuario);
  if (membro && Number(order.responsavel_id) === Number(membro.id)) return true;

  if (membro) {
    const auxiliar = await db.prepare(
      `SELECT 1 AS found
       FROM os_auxiliares
       WHERE empresa_id = ? AND os_id = ? AND membro_id = ?
       LIMIT 1`,
    ).get(usuario.empresa_id, order.id, membro.id);
    if (auxiliar) return true;
  }

  return clean(order.responsavel).toLowerCase() === clean(usuario.nome).toLowerCase();
}

async function getOrder(id, empresaId, usuario = null) {
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  const order = await db.prepare(
    "SELECT * FROM ordens_servico WHERE id = ? AND empresa_id = ?",
  ).get(orderId, empresaId);
  if (!order) return null;
  if (!(await usuarioPodeVerOrdem(order, usuario))) return null;

  const tarefas = await db.prepare(
    "SELECT * FROM os_tarefas WHERE os_id = ? ORDER BY id",
  ).all(order.id);
  const auxiliares = await db.prepare(
    "SELECT * FROM os_auxiliares WHERE os_id = ? AND empresa_id = ? ORDER BY nome",
  ).all(order.id, empresaId);
  const execucoes = await db.prepare(
    "SELECT * FROM os_execucoes WHERE os_id = ? AND empresa_id = ? ORDER BY criado_em DESC, id DESC",
  ).all(order.id, empresaId);
  const orcamento = await getOrderBudget(order.id, empresaId);
  return { ...order, itens: tarefas, auxiliares, execucoes, orcamento };
}

async function ensureOrderBudget(orderId, empresaId) {
  const current = await db.prepare(
    "SELECT * FROM os_orcamentos WHERE os_id = ? AND empresa_id = ? ORDER BY id LIMIT 1",
  ).get(orderId, empresaId);
  if (current) return current;

  const result = await db.prepare(
    "INSERT INTO os_orcamentos (empresa_id,os_id,status) VALUES (?,?,?)",
  ).run(empresaId, orderId, "rascunho");

  return db.prepare(
    "SELECT * FROM os_orcamentos WHERE id = ? AND empresa_id = ?",
  ).get(result.lastInsertRowid, empresaId);
}

async function getOrderBudget(orderId, empresaId) {
  const budget = await ensureOrderBudget(orderId, empresaId);
  const itens = await db.prepare(
    `SELECT *
     FROM os_orcamento_itens
     WHERE os_id = ? AND empresa_id = ?
     ORDER BY criado_em DESC, id DESC`,
  ).all(orderId, empresaId);
  const subtotal = itens.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const desconto = Math.max(0, Number(budget.desconto || 0));
  const acrescimo = Math.max(0, Number(budget.acrescimo || 0));
  const total = Math.max(0, subtotal - desconto + acrescimo);
  return { ...budget, itens, subtotal, total };
}

function cleanMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number * 100) / 100;
}

function cleanQuantity(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 1;
  return Math.round(number * 100) / 100;
}

function cleanBudgetItemPayload(body) {
  const descricao = clean(body.descricao).slice(0, 180);
  if (!descricao) return { erro: "Descricao obrigatoria" };
  const quantidade = cleanQuantity(body.quantidade);
  const valorUnitario = cleanMoney(body.valor_unitario);
  return {
    tipo: allowedBudgetItemTypes.includes(body.tipo) ? body.tipo : "servico",
    descricao,
    funcao: clean(body.funcao).slice(0, 80),
    quantidade,
    unidade: clean(body.unidade).slice(0, 20) || "un",
    valor_unitario: valorUnitario,
    total: Math.round(quantidade * valorUnitario * 100) / 100,
  };
}

async function getOrderPhotos(id, empresaId) {
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return [];
  return db.prepare(
    `SELECT * FROM fotos
     WHERE tipo = 'ordem' AND referencia_id = ? AND empresa_id = ?
     ORDER BY criado_em DESC, id DESC`,
  ).all(orderId, empresaId);
}

async function getOrderReport(order, empresaId) {
  const [cliente, embarcacao, fotos] = await Promise.all([
    order.cliente_id
      ? db.prepare("SELECT * FROM clientes WHERE id = ? AND empresa_id = ?").get(order.cliente_id, empresaId)
      : null,
    order.embarcacao_id
      ? db.prepare(
        `SELECT e.*, c.nome AS cliente_nome
         FROM embarcacoes e
         LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
         WHERE e.id = ? AND e.empresa_id = ?`,
      ).get(order.embarcacao_id, empresaId)
      : null,
    getOrderPhotos(order.id, empresaId),
  ]);

  return {
    ordem: order,
    cliente: cliente || {
      nome: order.cliente || "",
      documento: "",
      telefone: "",
      email: "",
      observacao: "",
    },
    embarcacao: embarcacao || {
      nome: order.embarcacao || "",
      tipo: "",
      marca: "",
      modelo: "",
      tamanho: "",
      registro: "",
      observacao: "",
    },
    tarefas: order.itens || [],
    auxiliares: order.auxiliares || [],
    execucoes: order.execucoes || [],
    orcamento: order.orcamento,
    fotos,
    fotos_por_tipo: {
      antes: fotos.filter((foto) => foto.categoria === "antes"),
      durante: fotos.filter((foto) => foto.categoria === "durante"),
      depois: fotos.filter((foto) => foto.categoria === "depois"),
      documento: fotos.filter((foto) => foto.categoria === "documento"),
      geral: fotos.filter((foto) => !["antes", "durante", "depois", "documento"].includes(foto.categoria)),
    },
  };
}

function cleanTaskList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clean(value) {
  return String(value || "").trim();
}

function cleanPhotoPayload(body) {
  const url = clean(body.url);
  if (!url) return { erro: "Foto obrigatoria" };
  if (!url.startsWith("data:image/") && !/^https?:\/\//i.test(url)) {
    return { erro: "Formato de foto invalido" };
  }
  if (url.length > 750000) return { erro: "Foto muito grande" };
  const categoria = allowedPhotoCategories.includes(body.categoria) ? body.categoria : "geral";
  const dataUrlMatch = url.match(/^data:([^;]+);base64,(.+)$/);
  const storageProvider = url.startsWith("data:image/") ? "data_url_mvp" : "external_url";
  return {
    url,
    categoria,
    legenda: clean(body.legenda).slice(0, 180),
    storage_provider: storageProvider,
    storage_key: storageProvider === "external_url" ? clean(body.storage_key).slice(0, 240) : "",
    mime_type: dataUrlMatch?.[1] || clean(body.mime_type).slice(0, 80),
    tamanho_bytes: dataUrlMatch?.[2] ? Math.ceil((dataUrlMatch[2].length * 3) / 4) : Number(body.tamanho_bytes) || 0,
  };
}

async function resolveCliente(value, empresaId) {
  const id = Number(value) || null;
  if (!id) return null;
  return db.prepare("SELECT id, nome FROM clientes WHERE id = ? AND empresa_id = ?")
    .get(id, empresaId);
}

async function resolveEmbarcacao(value, empresaId) {
  const id = Number(value) || null;
  if (!id) return null;
  return db.prepare(
    `SELECT e.id, e.nome, e.cliente_id, c.nome AS cliente_nome
     FROM embarcacoes e
     LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
     WHERE e.id = ? AND e.empresa_id = ?`,
  ).get(id, empresaId);
}

async function resolveMembro(value, empresaId) {
  const id = Number(value) || null;
  if (!id) return null;
  return db.prepare(
    "SELECT id, nome, funcao, cargo FROM tripulacao WHERE id = ? AND empresa_id = ?",
  ).get(id, empresaId);
}

async function replaceAuxiliares(orderId, empresaId, values) {
  await db.prepare(
    "DELETE FROM os_auxiliares WHERE os_id = ? AND empresa_id = ?",
  ).run(orderId, empresaId);

  const ids = Array.isArray(values) ? values : [];
  const uniqueIds = [...new Set(ids.map((item) => Number(item)).filter((id) => Number.isInteger(id) && id > 0))];
  for (const id of uniqueIds) {
    const membro = await resolveMembro(id, empresaId);
    if (!membro) continue;
    await db.prepare(
      `INSERT INTO os_auxiliares (empresa_id,os_id,membro_id,nome,funcao)
       VALUES (?,?,?,?,?)`,
    ).run(empresaId, orderId, membro.id, membro.nome, membro.funcao || membro.cargo || "");
  }
}

router.get("/", auth, async (req, res) => {
  const ordens = await db.prepare(
    `SELECT * FROM ordens_servico
     WHERE empresa_id = ?
     ORDER BY criado_em DESC`,
  ).all(req.usuario.empresa_id);

  const hydrated = await Promise.all(ordens.map((os) => getOrder(os.id, req.usuario.empresa_id, req.usuario)));
  const result = hydrated.filter(Boolean);

  return res.json(result);
});

router.get("/modelos", auth, async (req, res) => {
  return res.json(Object.entries(serviceTemplates).map(([id, data]) => ({ id, ...data })));
});

router.post("/", auth, canManage, requirePlanoAtivo, requireLimite("ordensMes"), async (req, res) => {
  const { tipo, prioridade, descricao, responsavel, previsao, tarefas } = req.body;
  const selectedTemplate = serviceTemplates[clean(req.body.modelo || "").toLowerCase()]
    || serviceTemplates[clean(tipo).toLowerCase()];
  const selectedCliente = await resolveCliente(req.body.cliente_id, req.usuario.empresa_id);
  const selectedEmbarcacao = await resolveEmbarcacao(req.body.embarcacao_id, req.usuario.empresa_id);
  const embarcacao = selectedEmbarcacao?.nome || clean(req.body.embarcacao);
  const cliente = selectedCliente?.nome || selectedEmbarcacao?.cliente_nome || clean(req.body.cliente);
  const clienteId = selectedCliente?.id || selectedEmbarcacao?.cliente_id || null;
  const embarcacaoId = selectedEmbarcacao?.id || null;
  const selectedResponsavel = await resolveMembro(req.body.responsavel_id, req.usuario.empresa_id);
  const responsavelNome = selectedResponsavel?.nome || clean(responsavel);
  const responsavelId = selectedResponsavel?.id || null;

  if (!embarcacao) {
    return res.status(400).json({ erro: "Embarcacao obrigatoria" });
  }

  const count = await db.prepare(
    "SELECT COUNT(*) AS total FROM ordens_servico WHERE empresa_id = ?",
  ).get(req.usuario.empresa_id);
  const sequence = String(Number(count.total) + 1).padStart(4, "0");
  const codigo = `OS-${new Date().getFullYear()}-${req.usuario.empresa_id}-${sequence}`;

  const result = await db.prepare(
    `INSERT INTO ordens_servico
     (empresa_id,codigo,embarcacao,cliente,cliente_id,embarcacao_id,tipo,prioridade,descricao,responsavel,responsavel_id,previsao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    codigo,
    embarcacao,
    cliente,
    clienteId,
    embarcacaoId,
    selectedTemplate?.tipo || tipo || "Servico",
    allowedPriorities.includes(prioridade) ? prioridade : "normal",
    descricao || "",
    responsavelNome,
    responsavelId,
    previsao || "",
  );

  await replaceAuxiliares(result.lastInsertRowid, req.usuario.empresa_id, req.body.auxiliares);

  const taskList = cleanTaskList(tarefas);
  const finalTasks = taskList.length ? taskList : selectedTemplate?.tarefas || [];
  for (const tarefa of finalTasks) {
    await db.prepare("INSERT INTO os_tarefas (os_id,tarefa,done) VALUES (?,?,?)")
      .run(result.lastInsertRowid, tarefa, 0);
  }

  const created = await getOrder(result.lastInsertRowid, req.usuario.empresa_id, req.usuario);
  await audit(req.usuario, "ordem_servico", created.id, "criar", `OS ${created.codigo} criada`, null, created);
  return res.status(201).json(created);
});

router.put("/:id", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const current = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!current) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const selectedCliente = Object.prototype.hasOwnProperty.call(req.body, "cliente_id")
    ? await resolveCliente(req.body.cliente_id, req.usuario.empresa_id)
    : null;
  const selectedEmbarcacao = Object.prototype.hasOwnProperty.call(req.body, "embarcacao_id")
    ? await resolveEmbarcacao(req.body.embarcacao_id, req.usuario.empresa_id)
    : null;
  const clienteId = Object.prototype.hasOwnProperty.call(req.body, "cliente_id")
    ? selectedCliente?.id || selectedEmbarcacao?.cliente_id || null
    : current.cliente_id;
  const embarcacaoId = Object.prototype.hasOwnProperty.call(req.body, "embarcacao_id")
    ? selectedEmbarcacao?.id || null
    : current.embarcacao_id;
  const selectedResponsavel = Object.prototype.hasOwnProperty.call(req.body, "responsavel_id")
    ? await resolveMembro(req.body.responsavel_id, req.usuario.empresa_id)
    : null;
  const responsavelId = Object.prototype.hasOwnProperty.call(req.body, "responsavel_id")
    ? selectedResponsavel?.id || null
    : current.responsavel_id;

  const fields = {
    embarcacao: selectedEmbarcacao?.nome || String(req.body.embarcacao ?? current.embarcacao).trim(),
    cliente: selectedCliente?.nome || selectedEmbarcacao?.cliente_nome || String(req.body.cliente ?? current.cliente ?? "").trim(),
    cliente_id: clienteId,
    embarcacao_id: embarcacaoId,
    tipo: String(req.body.tipo ?? current.tipo ?? "Servico").trim() || "Servico",
    prioridade: allowedPriorities.includes(req.body.prioridade) ? req.body.prioridade : current.prioridade,
    status: allowedStatus.includes(req.body.status) ? req.body.status : current.status,
    descricao: String(req.body.descricao ?? current.descricao ?? "").trim(),
    responsavel: selectedResponsavel?.nome || String(req.body.responsavel ?? current.responsavel ?? "").trim(),
    responsavel_id: responsavelId,
    previsao: String(req.body.previsao ?? current.previsao ?? "").trim(),
    observacao: String(req.body.observacao ?? current.observacao ?? "").trim(),
  };

  if (!fields.embarcacao) {
    return res.status(400).json({ erro: "Embarcacao obrigatoria" });
  }

  await db.prepare(
    `UPDATE ordens_servico
     SET embarcacao = ?, cliente = ?, cliente_id = ?, embarcacao_id = ?,
         tipo = ?, prioridade = ?, status = ?,
         descricao = ?, responsavel = ?, responsavel_id = ?, previsao = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    fields.embarcacao,
    fields.cliente,
    fields.cliente_id,
    fields.embarcacao_id,
    fields.tipo,
    fields.prioridade,
    fields.status,
    fields.descricao,
    fields.responsavel,
    fields.responsavel_id,
    fields.previsao,
    fields.observacao,
    req.params.id,
    req.usuario.empresa_id,
  );

  if (Object.prototype.hasOwnProperty.call(req.body, "auxiliares")) {
    await replaceAuxiliares(req.params.id, req.usuario.empresa_id, req.body.auxiliares);
  }

  const updated = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  await audit(req.usuario, "ordem_servico", updated.id, "editar", `OS ${updated.codigo} editada`, current, updated);
  return res.json(updated);
});

router.put("/:id/status", auth, canManage, requirePlanoAtivo, async (req, res) => {
  if (!allowedStatus.includes(req.body.status)) {
    return res.status(400).json({ erro: "Status invalido" });
  }
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const result = await db.prepare(
    "UPDATE ordens_servico SET status = ? WHERE id = ? AND empresa_id = ?",
  ).run(req.body.status, req.params.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Ordem nao encontrada" });
  const updated = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  await audit(req.usuario, "ordem_servico", updated.id, "alterar_status", `Status da ${updated.codigo}: ${order.status} -> ${updated.status}`, order, updated);
  return res.json(updated);
});

router.post("/:id/tarefas", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const tarefa = String(req.body.tarefa || "").trim();
  if (!tarefa) return res.status(400).json({ erro: "Tarefa obrigatoria" });

  await db.prepare("INSERT INTO os_tarefas (os_id,tarefa,done) VALUES (?,?,?)")
    .run(req.params.id, tarefa, 0);
  return res.status(201).json(await getOrder(req.params.id, req.usuario.empresa_id, req.usuario));
});

router.put("/:id/orcamento", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const current = await ensureOrderBudget(order.id, req.usuario.empresa_id);
  const status = allowedBudgetStatus.includes(req.body.status) ? req.body.status : current.status || "rascunho";
  const clienteAprovou = status === "aprovado" ? 1 : Number(req.body.cliente_aprovou || current.cliente_aprovou || 0);
  const aprovadoPor = clean(req.body.aprovado_por ?? current.aprovado_por).slice(0, 120);

  await db.prepare(
    `UPDATE os_orcamentos
     SET status = ?, desconto = ?, acrescimo = ?, cliente_aprovou = ?,
         aprovado_por = ?, aprovado_em = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    status,
    cleanMoney(req.body.desconto ?? current.desconto),
    cleanMoney(req.body.acrescimo ?? current.acrescimo),
    clienteAprovou,
    aprovadoPor,
    clienteAprovou && !current.aprovado_em ? new Date().toISOString() : current.aprovado_em,
    clean(req.body.observacao ?? current.observacao).slice(0, 240),
    current.id,
    req.usuario.empresa_id,
  );

  const budget = await getOrderBudget(order.id, req.usuario.empresa_id);
  await audit(req.usuario, "orcamento", order.id, "atualizar", `Orcamento da ${order.codigo} atualizado para ${budget.status}`, current, budget);
  return res.json(budget);
});

router.post("/:id/orcamento/itens", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  await ensureOrderBudget(order.id, req.usuario.empresa_id);
  const item = cleanBudgetItemPayload(req.body);
  if (item.erro) return res.status(400).json({ erro: item.erro });

  await db.prepare(
    `INSERT INTO os_orcamento_itens
     (empresa_id,os_id,tipo,descricao,funcao,quantidade,unidade,valor_unitario,total)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    order.id,
    item.tipo,
    item.descricao,
    item.funcao,
    item.quantidade,
    item.unidade,
    item.valor_unitario,
    item.total,
  );

  return res.status(201).json(await getOrderBudget(order.id, req.usuario.empresa_id));
});

router.delete("/:id/orcamento/itens/:itemId", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const result = await db.prepare(
    `DELETE FROM os_orcamento_itens
     WHERE id = ? AND os_id = ? AND empresa_id = ?`,
  ).run(req.params.itemId, order.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Item nao encontrado" });
  return res.json(await getOrderBudget(order.id, req.usuario.empresa_id));
});

router.get("/:id/relatorio", auth, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });
  return res.json(await getOrderReport(order, req.usuario.empresa_id));
});

router.post("/:id/relatorio/aceite", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  await db.prepare(
    `UPDATE ordens_servico
     SET relatorio_aceito = ?, relatorio_aceito_por = ?, relatorio_aceito_em = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    req.body.aceito === false ? 0 : 1,
    clean(req.body.aceito_por || order.cliente || "").slice(0, 120),
    new Date().toISOString(),
    order.id,
    req.usuario.empresa_id,
  );

  const updated = await getOrder(order.id, req.usuario.empresa_id, req.usuario);
  await audit(req.usuario, "relatorio", order.id, "aceite", `Aceite do relatorio da ${order.codigo} registrado`, order, updated);
  return res.json(await getOrderReport(updated, req.usuario.empresa_id));
});

router.post("/:id/orcamento/aprovacao", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const current = await ensureOrderBudget(order.id, req.usuario.empresa_id);
  const aprovado = req.body.aprovado !== false;
  await db.prepare(
    `UPDATE os_orcamentos
     SET status = ?, cliente_aprovou = ?, aprovado_por = ?, aprovado_em = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    aprovado ? "aprovado" : "recusado",
    aprovado ? 1 : 0,
    clean(req.body.aprovado_por || order.cliente || current.aprovado_por).slice(0, 120),
    new Date().toISOString(),
    clean(req.body.observacao ?? current.observacao).slice(0, 240),
    current.id,
    req.usuario.empresa_id,
  );

  const updated = await getOrderBudget(order.id, req.usuario.empresa_id);
  await audit(req.usuario, "orcamento", order.id, aprovado ? "aprovar" : "recusar", `Orcamento da ${order.codigo} ${aprovado ? "aprovado" : "recusado"}`, current, updated);
  return res.json(updated);
});

router.get("/:id/fotos", auth, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });
  return res.json(await getOrderPhotos(req.params.id, req.usuario.empresa_id));
});

router.post("/:id/fotos", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const foto = cleanPhotoPayload(req.body);
  if (foto.erro) return res.status(400).json({ erro: foto.erro });

  const result = await db.prepare(
    `INSERT INTO fotos
     (empresa_id,tipo,referencia_id,url,legenda,categoria,storage_provider,storage_key,mime_type,tamanho_bytes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    "ordem",
    req.params.id,
    foto.url,
    foto.legenda,
    foto.categoria,
    foto.storage_provider,
    foto.storage_key,
    foto.mime_type,
    foto.tamanho_bytes,
  );

  await db.prepare(
    "UPDATE ordens_servico SET fotos = fotos + 1 WHERE id = ? AND empresa_id = ?",
  ).run(req.params.id, req.usuario.empresa_id);

  return res.status(201).json({
    id: result.lastInsertRowid,
    empresa_id: req.usuario.empresa_id,
    tipo: "ordem",
    referencia_id: Number(req.params.id),
    ...foto,
  });
});

router.post("/:id/execucoes", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const descricao = clean(req.body.descricao);
  if (!descricao) return res.status(400).json({ erro: "Descricao obrigatoria" });

  const membro = await resolveMembro(req.body.membro_id, req.usuario.empresa_id);
  const autor = membro?.nome || clean(req.body.autor) || req.usuario.nome;
  const result = await db.prepare(
    `INSERT INTO os_execucoes (empresa_id,os_id,membro_id,autor,descricao)
     VALUES (?,?,?,?,?)`,
  ).run(req.usuario.empresa_id, req.params.id, membro?.id || null, autor, descricao);

  return res.status(201).json({
    id: result.lastInsertRowid,
    empresa_id: req.usuario.empresa_id,
    os_id: Number(req.params.id),
    membro_id: membro?.id || null,
    autor,
    descricao,
  });
});

router.put("/:id/tarefa/:tarefaId", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id, req.usuario);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const tarefa = await db.prepare(
    `SELECT t.done
     FROM os_tarefas t
     JOIN ordens_servico os ON os.id = t.os_id
     WHERE t.id = ? AND t.os_id = ? AND os.empresa_id = ?`,
  ).get(req.params.tarefaId, req.params.id, req.usuario.empresa_id);

  if (!tarefa) return res.status(404).json({ erro: "Tarefa nao encontrada" });

  await db.prepare("UPDATE os_tarefas SET done = ? WHERE id = ?")
    .run(tarefa.done ? 0 : 1, req.params.tarefaId);
  return res.json(await getOrder(req.params.id, req.usuario.empresa_id, req.usuario));
});

module.exports = router;
