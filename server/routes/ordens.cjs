const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");
const { requirePlanoAtivo, requireLimite } = require("../planos.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico", "marinharia"],
});
const allowedStatus = ["aguardando", "em_andamento", "concluida", "cancelada"];
const allowedPriorities = ["baixa", "media", "normal", "alta", "urgente"];
const allowedPhotoCategories = ["geral", "antes", "durante", "depois", "documento"];

async function getOrder(id, empresaId) {
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  const order = await db.prepare(
    "SELECT * FROM ordens_servico WHERE id = ? AND empresa_id = ?",
  ).get(orderId, empresaId);
  if (!order) return null;

  const tarefas = await db.prepare(
    "SELECT * FROM os_tarefas WHERE os_id = ? ORDER BY id",
  ).all(order.id);
  return { ...order, itens: tarefas };
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
  return {
    url,
    categoria,
    legenda: clean(body.legenda).slice(0, 180),
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

router.get("/", auth, async (req, res) => {
  const ordens = await db.prepare(
    `SELECT * FROM ordens_servico
     WHERE empresa_id = ?
     ORDER BY criado_em DESC`,
  ).all(req.usuario.empresa_id);

  const result = await Promise.all(ordens.map(async (os) => {
    const tarefas = await db.prepare(
      "SELECT * FROM os_tarefas WHERE os_id = ? ORDER BY id",
    ).all(os.id);
    return { ...os, itens: tarefas };
  }));

  return res.json(result);
});

router.post("/", auth, canManage, requirePlanoAtivo, requireLimite("ordensMes"), async (req, res) => {
  const { tipo, prioridade, descricao, responsavel, previsao, tarefas } = req.body;
  const selectedCliente = await resolveCliente(req.body.cliente_id, req.usuario.empresa_id);
  const selectedEmbarcacao = await resolveEmbarcacao(req.body.embarcacao_id, req.usuario.empresa_id);
  const embarcacao = selectedEmbarcacao?.nome || clean(req.body.embarcacao);
  const cliente = selectedCliente?.nome || selectedEmbarcacao?.cliente_nome || clean(req.body.cliente);
  const clienteId = selectedCliente?.id || selectedEmbarcacao?.cliente_id || null;
  const embarcacaoId = selectedEmbarcacao?.id || null;

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
     (empresa_id,codigo,embarcacao,cliente,cliente_id,embarcacao_id,tipo,prioridade,descricao,responsavel,previsao)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    codigo,
    embarcacao,
    cliente,
    clienteId,
    embarcacaoId,
    tipo || "Servico",
    allowedPriorities.includes(prioridade) ? prioridade : "normal",
    descricao || "",
    responsavel || "",
    previsao || "",
  );

  for (const tarefa of cleanTaskList(tarefas)) {
    await db.prepare("INSERT INTO os_tarefas (os_id,tarefa,done) VALUES (?,?,?)")
      .run(result.lastInsertRowid, tarefa, 0);
  }

  const created = await getOrder(result.lastInsertRowid, req.usuario.empresa_id);
  return res.status(201).json(created);
});

router.put("/:id", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const current = await getOrder(req.params.id, req.usuario.empresa_id);
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

  const fields = {
    embarcacao: selectedEmbarcacao?.nome || String(req.body.embarcacao ?? current.embarcacao).trim(),
    cliente: selectedCliente?.nome || selectedEmbarcacao?.cliente_nome || String(req.body.cliente ?? current.cliente ?? "").trim(),
    cliente_id: clienteId,
    embarcacao_id: embarcacaoId,
    tipo: String(req.body.tipo ?? current.tipo ?? "Servico").trim() || "Servico",
    prioridade: allowedPriorities.includes(req.body.prioridade) ? req.body.prioridade : current.prioridade,
    status: allowedStatus.includes(req.body.status) ? req.body.status : current.status,
    descricao: String(req.body.descricao ?? current.descricao ?? "").trim(),
    responsavel: String(req.body.responsavel ?? current.responsavel ?? "").trim(),
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
         descricao = ?, responsavel = ?, previsao = ?, observacao = ?
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
    fields.previsao,
    fields.observacao,
    req.params.id,
    req.usuario.empresa_id,
  );

  return res.json(await getOrder(req.params.id, req.usuario.empresa_id));
});

router.put("/:id/status", auth, canManage, requirePlanoAtivo, async (req, res) => {
  if (!allowedStatus.includes(req.body.status)) {
    return res.status(400).json({ erro: "Status invalido" });
  }

  const result = await db.prepare(
    "UPDATE ordens_servico SET status = ? WHERE id = ? AND empresa_id = ?",
  ).run(req.body.status, req.params.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Ordem nao encontrada" });
  return res.json(await getOrder(req.params.id, req.usuario.empresa_id));
});

router.post("/:id/tarefas", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const tarefa = String(req.body.tarefa || "").trim();
  if (!tarefa) return res.status(400).json({ erro: "Tarefa obrigatoria" });

  await db.prepare("INSERT INTO os_tarefas (os_id,tarefa,done) VALUES (?,?,?)")
    .run(req.params.id, tarefa, 0);
  return res.status(201).json(await getOrder(req.params.id, req.usuario.empresa_id));
});

router.get("/:id/fotos", auth, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });
  return res.json(await getOrderPhotos(req.params.id, req.usuario.empresa_id));
});

router.post("/:id/fotos", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const order = await getOrder(req.params.id, req.usuario.empresa_id);
  if (!order) return res.status(404).json({ erro: "Ordem nao encontrada" });

  const foto = cleanPhotoPayload(req.body);
  if (foto.erro) return res.status(400).json({ erro: foto.erro });

  const result = await db.prepare(
    `INSERT INTO fotos (empresa_id,tipo,referencia_id,url,legenda,categoria)
     VALUES (?,?,?,?,?,?)`,
  ).run(req.usuario.empresa_id, "ordem", req.params.id, foto.url, foto.legenda, foto.categoria);

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

router.put("/:id/tarefa/:tarefaId", auth, canManage, requirePlanoAtivo, async (req, res) => {
  const tarefa = await db.prepare(
    `SELECT t.done
     FROM os_tarefas t
     JOIN ordens_servico os ON os.id = t.os_id
     WHERE t.id = ? AND t.os_id = ? AND os.empresa_id = ?`,
  ).get(req.params.tarefaId, req.params.id, req.usuario.empresa_id);

  if (!tarefa) return res.status(404).json({ erro: "Tarefa nao encontrada" });

  await db.prepare("UPDATE os_tarefas SET done = ? WHERE id = ?")
    .run(tarefa.done ? 0 : 1, req.params.tarefaId);
  return res.json(await getOrder(req.params.id, req.usuario.empresa_id));
});

module.exports = router;
