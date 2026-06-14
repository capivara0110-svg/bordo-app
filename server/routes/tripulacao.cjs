const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/tripulacao
router.get("/", auth, async (req, res) => {
  const membros = await db.prepare("SELECT * FROM tripulacao ORDER BY nome").all();
  res.json(membros);
});

// POST /api/tripulacao
router.post("/", auth, async (req, res) => {
  const { nome, cargo, habilitacao, certificado, avatar } = req.body;
  if (!nome || !cargo) return res.status(400).json({ erro: "Nome e cargo obrigatórios" });

  const result = await db.prepare(
    "INSERT INTO tripulacao (nome, cargo, habilitacao, certificado, avatar) VALUES (?, ?, ?, ?, ?)"
  ).run(nome, cargo, habilitacao || "", certificado || "", avatar || "??");

  res.status(201).json({ id: result.lastInsertRowid, nome, cargo });
});

// PUT /api/tripulacao/:id
router.put("/:id", auth, async (req, res) => {
  const { nome, cargo, habilitacao, certificado, status } = req.body;
  await db.prepare(
    "UPDATE tripulacao SET nome = ?, cargo = ?, habilitacao = ?, certificado = ?, status = ? WHERE id = ?"
  ).run(nome, cargo, habilitacao, certificado, status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
