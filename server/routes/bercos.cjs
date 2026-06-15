const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");

router.get("/", auth, async (req, res) => {
  const bercos = await db.prepare(
    "SELECT * FROM bercos WHERE empresa_id = ? ORDER BY numero",
  ).all(req.usuario.empresa_id);
  return res.json(bercos);
});

router.put("/:id", auth, canManage, async (req, res) => {
  const { embarcacao, cliente, status, entrada, saida } = req.body;
  const result = await db.prepare(
    `UPDATE bercos
     SET embarcacao = ?, cliente = ?, status = ?, entrada = ?, saida = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    embarcacao || "-",
    cliente || "-",
    status || "livre",
    entrada || "-",
    saida || "-",
    req.params.id,
    req.usuario.empresa_id,
  );

  if (!result.changes) return res.status(404).json({ erro: "Berco nao encontrado" });
  return res.json({ ok: true });
});

module.exports = router;
