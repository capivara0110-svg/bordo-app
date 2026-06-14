const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/checklist
router.get("/", auth, async (req, res) => {
  const itens = await db.prepare("SELECT * FROM checklist WHERE usuario_id = ? ORDER BY categoria, id").all(req.usuario.id);
  res.json(itens);
});

// PUT /api/checklist/:id/toggle
router.put("/:id/toggle", auth, async (req, res) => {
  const item = await db.prepare("SELECT feito FROM checklist WHERE id = ? AND usuario_id = ?").get(req.params.id, req.usuario.id);
  if (!item) return res.status(404).json({ erro: "Item não encontrado" });

  await db.prepare("UPDATE checklist SET feito = ? WHERE id = ?").run(item.feito ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

// POST /api/checklist
router.post("/", auth, async (req, res) => {
  const { categoria, item } = req.body;
  if (!categoria || !item) return res.status(400).json({ erro: "Categoria e item obrigatórios" });

  const result = await db.prepare(
    "INSERT INTO checklist (usuario_id, categoria, item) VALUES (?, ?, ?)"
  ).run(req.usuario.id, categoria, item);

  res.status(201).json({ id: result.lastInsertRowid, categoria, item, feito: 0 });
});

module.exports = router;
