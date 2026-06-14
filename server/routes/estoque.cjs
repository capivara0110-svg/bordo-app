const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/estoque
router.get("/", auth, (req, res) => {
  const itens = db.prepare("SELECT * FROM estoque ORDER BY categoria, nome").all();
  res.json(itens);
});

// POST /api/estoque
router.post("/", auth, (req, res) => {
  const { nome, unidade, quantidade, minimo, categoria } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome obrigatório" });

  const result = db.prepare(
    "INSERT INTO estoque (nome, unidade, quantidade, minimo, categoria) VALUES (?, ?, ?, ?, ?)"
  ).run(nome, unidade || "un", quantidade || 0, minimo || 0, categoria || "Geral");

  res.status(201).json({ id: result.lastInsertRowid, nome });
});

// PUT /api/estoque/:id
router.put("/:id", auth, (req, res) => {
  const { quantidade } = req.body;
  db.prepare("UPDATE estoque SET quantidade = ? WHERE id = ?").run(quantidade, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
