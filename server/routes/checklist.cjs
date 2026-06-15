const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const itens = await db.prepare(
    `SELECT * FROM checklist
     WHERE empresa_id = ? AND usuario_id = ?
     ORDER BY categoria, id`,
  ).all(req.usuario.empresa_id, req.usuario.id);
  return res.json(itens);
});

router.put("/:id/toggle", auth, async (req, res) => {
  const item = await db.prepare(
    `SELECT feito FROM checklist
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).get(req.params.id, req.usuario.empresa_id, req.usuario.id);
  if (!item) return res.status(404).json({ erro: "Item nao encontrado" });

  await db.prepare(
    `UPDATE checklist SET feito = ?
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).run(item.feito ? 0 : 1, req.params.id, req.usuario.empresa_id, req.usuario.id);
  return res.json({ ok: true });
});

router.post("/", auth, async (req, res) => {
  const { categoria, item } = req.body;
  if (!categoria || !item) {
    return res.status(400).json({ erro: "Categoria e item obrigatorios" });
  }

  const result = await db.prepare(
    `INSERT INTO checklist (empresa_id,usuario_id,categoria,item)
     VALUES (?,?,?,?)`,
  ).run(req.usuario.empresa_id, req.usuario.id, categoria, item);

  return res.status(201).json({
    id: result.lastInsertRowid,
    categoria,
    item,
    feito: 0,
  });
});

module.exports = router;
