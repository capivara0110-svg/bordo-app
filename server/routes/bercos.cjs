const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/bercos
router.get("/", auth, async (req, res) => {
  const bercos = await db.prepare("SELECT * FROM bercos ORDER BY numero").all();
  res.json(bercos);
});

// PUT /api/bercos/:id
router.put("/:id", auth, async (req, res) => {
  const { embarcacao, cliente, status, entrada, saida } = req.body;
  await db.prepare(
    "UPDATE bercos SET embarcacao = ?, cliente = ?, status = ?, entrada = ?, saida = ? WHERE id = ?"
  ).run(embarcacao || "—", cliente || "—", status || "livre", entrada || "—", saida || "—", req.params.id);
  res.json({ ok: true });
});

module.exports = router;
