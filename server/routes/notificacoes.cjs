const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/notificacoes
router.get("/", auth, async (req, res) => {
  const notificacoes = await db.prepare("SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criado_em DESC").all(req.usuario.id);
  res.json(notificacoes);
});

// PUT /api/notificacoes/:id/ler
router.put("/:id/ler", auth, async (req, res) => {
  await db.prepare("UPDATE notificacoes SET lida = 1 WHERE id = ? AND usuario_id = ?").run(req.params.id, req.usuario.id);
  res.json({ ok: true });
});

// POST /api/notificacoes (para sistema criar notificações)
router.post("/", auth, async (req, res) => {
  const { tipo, icone, titulo, corpo, acao, categoria } = req.body;
  if (!titulo) return res.status(400).json({ erro: "Título obrigatório" });

  const result = await db.prepare(
    "INSERT INTO notificacoes (usuario_id, tipo, icone, titulo, corpo, acao, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(req.usuario.id, tipo || "info", icone || "??", titulo, corpo || "", acao || "", categoria || "geral");

  res.status(201).json({ id: result.lastInsertRowid, titulo });
});

module.exports = router;
