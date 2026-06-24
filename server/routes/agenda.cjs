const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const ordens = await db.prepare(
    `SELECT id, codigo, embarcacao, cliente, tipo, prioridade, status,
            descricao, responsavel, previsao, criado_em
     FROM ordens_servico
     WHERE empresa_id = ? AND previsao != '' AND status != 'cancelada'
     ORDER BY previsao ASC, criado_em DESC`,
  ).all(req.usuario.empresa_id);

  return res.json(ordens);
});

module.exports = router;
