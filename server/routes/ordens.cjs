const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/ordens
router.get("/", auth, async (req, res) => {
  const ordens = await db.prepare("SELECT * FROM ordens_servico ORDER BY criado_em DESC").all();
  // Adiciona tarefas em cada OS
  const ordensComTarefas = await Promise.all(ordens.map(async (os) => {
    const tarefas = await db.prepare("SELECT * FROM os_tarefas WHERE os_id = ?").all(os.id);
    return { ...os, itens: tarefas };
  }));
  res.json(ordensComTarefas);
});

// POST /api/ordens
router.post("/", auth, async (req, res) => {
  const { embarcacao, cliente, tipo, prioridade, descricao, responsavel, previsao } = req.body;
  if (!embarcacao) return res.status(400).json({ erro: "Embarcação obrigatória" });

  // Gera código automático
  const count = await db.prepare("SELECT COUNT(*) as total FROM ordens_servico").get();
  const codigo = `OS-${new Date().getFullYear()}-${String(Number(count.total) + 1).padStart(3, "0")}`;

  const result = await db.prepare(
    "INSERT INTO ordens_servico (codigo, embarcacao, cliente, tipo, prioridade, descricao, responsavel, previsao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(codigo, embarcacao, cliente || "", tipo || "Serviço", prioridade || "normal", descricao || "", responsavel || "", previsao || "");

  res.status(201).json({
    id: result.lastInsertRowid,
    codigo,
    embarcacao,
    cliente,
    tipo,
    prioridade,
    status: "aguardando",
    itens: []
  });
});

// PUT /api/ordens/:id/status
router.put("/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  await db.prepare("UPDATE ordens_servico SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

// PUT /api/ordens/:id/tarefa/:tarefaId
router.put("/:id/tarefa/:tarefaId", auth, async (req, res) => {
  const tarefa = await db.prepare("SELECT done FROM os_tarefas WHERE id = ? AND os_id = ?").get(req.params.tarefaId, req.params.id);
  if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });

  await db.prepare("UPDATE os_tarefas SET done = ? WHERE id = ?").run(tarefa.done ? 0 : 1, req.params.tarefaId);
  res.json({ ok: true });
});

module.exports = router;
