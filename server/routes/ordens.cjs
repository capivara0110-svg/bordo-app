const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico", "marinharia"],
});

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

router.post("/", auth, canManage, async (req, res) => {
  const { embarcacao, cliente, tipo, prioridade, descricao, responsavel, previsao } = req.body;
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
     (empresa_id,codigo,embarcacao,cliente,tipo,prioridade,descricao,responsavel,previsao)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    codigo,
    embarcacao,
    cliente || "",
    tipo || "Servico",
    prioridade || "normal",
    descricao || "",
    responsavel || "",
    previsao || "",
  );

  return res.status(201).json({
    id: result.lastInsertRowid,
    empresa_id: req.usuario.empresa_id,
    codigo,
    embarcacao,
    cliente,
    tipo,
    prioridade,
    status: "aguardando",
    itens: [],
  });
});

router.put("/:id/status", auth, canManage, async (req, res) => {
  const allowed = ["aguardando", "em_andamento", "concluida", "cancelada"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ erro: "Status invalido" });
  }

  const result = await db.prepare(
    "UPDATE ordens_servico SET status = ? WHERE id = ? AND empresa_id = ?",
  ).run(req.body.status, req.params.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Ordem nao encontrada" });
  return res.json({ ok: true });
});

router.put("/:id/tarefa/:tarefaId", auth, canManage, async (req, res) => {
  const tarefa = await db.prepare(
    `SELECT t.done
     FROM os_tarefas t
     JOIN ordens_servico os ON os.id = t.os_id
     WHERE t.id = ? AND t.os_id = ? AND os.empresa_id = ?`,
  ).get(req.params.tarefaId, req.params.id, req.usuario.empresa_id);

  if (!tarefa) return res.status(404).json({ erro: "Tarefa nao encontrada" });

  await db.prepare("UPDATE os_tarefas SET done = ? WHERE id = ?")
    .run(tarefa.done ? 0 : 1, req.params.tarefaId);
  return res.json({ ok: true });
});

module.exports = router;
