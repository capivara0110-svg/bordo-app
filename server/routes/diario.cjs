const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/diario
router.get("/", auth, async (req, res) => {
  const registros = await db.prepare("SELECT * FROM diario WHERE usuario_id = ? ORDER BY criado_em DESC").all(req.usuario.id);
  res.json(registros);
});

// POST /api/diario
router.post("/", auth, async (req, res) => {
  const { tipo, descricao, autor } = req.body;
  if (!tipo || !descricao) return res.status(400).json({ erro: "Tipo e descrição obrigatórios" });

  const result = await db.prepare(
    "INSERT INTO diario (usuario_id, tipo, descricao, autor) VALUES (?, ?, ?, ?)"
  ).run(req.usuario.id, tipo, descricao, autor || req.usuario.nome);

  const registro = await db.prepare("SELECT * FROM diario WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(registro);
});

// PUT /api/diario/:id/assinar
router.put("/:id/assinar", auth, async (req, res) => {
  await db.prepare("UPDATE diario SET assinado = 1 WHERE id = ? AND usuario_id = ?").run(req.params.id, req.usuario.id);
  res.json({ ok: true });
});

module.exports = router;
