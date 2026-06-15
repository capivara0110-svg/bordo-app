const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const registros = await db.prepare(
    `SELECT * FROM diario
     WHERE empresa_id = ? AND usuario_id = ?
     ORDER BY criado_em DESC`,
  ).all(req.usuario.empresa_id, req.usuario.id);
  return res.json(registros);
});

router.post("/", auth, async (req, res) => {
  const { tipo, descricao } = req.body;
  if (!tipo || !descricao) {
    return res.status(400).json({ erro: "Tipo e descricao obrigatorios" });
  }

  const now = new Date();
  const data = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const hora = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const result = await db.prepare(
    `INSERT INTO diario
     (empresa_id,usuario_id,tipo,descricao,autor,data,hora)
     VALUES (?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    req.usuario.id,
    tipo,
    descricao,
    req.usuario.nome,
    data,
    hora,
  );

  const registro = await db.prepare(
    "SELECT * FROM diario WHERE id = ? AND empresa_id = ?",
  ).get(result.lastInsertRowid, req.usuario.empresa_id);
  return res.status(201).json(registro);
});

router.put("/:id/assinar", auth, async (req, res) => {
  const result = await db.prepare(
    `UPDATE diario SET assinado = 1
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).run(req.params.id, req.usuario.empresa_id, req.usuario.id);

  if (!result.changes) return res.status(404).json({ erro: "Registro nao encontrado" });
  return res.json({ ok: true });
});

module.exports = router;
