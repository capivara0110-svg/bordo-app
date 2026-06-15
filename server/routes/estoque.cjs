const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico"],
});

router.get("/", auth, async (req, res) => {
  const itens = await db.prepare(
    "SELECT * FROM estoque WHERE empresa_id = ? ORDER BY categoria, nome",
  ).all(req.usuario.empresa_id);
  return res.json(itens);
});

router.post("/", auth, canManage, async (req, res) => {
  const { nome, unidade, quantidade, minimo, categoria } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome obrigatorio" });

  const result = await db.prepare(
    `INSERT INTO estoque
     (empresa_id,nome,unidade,quantidade,minimo,categoria)
     VALUES (?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    nome,
    unidade || "un",
    Number(quantidade) || 0,
    Number(minimo) || 0,
    categoria || "Geral",
  );

  return res.status(201).json({ id: result.lastInsertRowid, nome });
});

router.put("/:id", auth, canManage, async (req, res) => {
  const quantidade = Number(req.body.quantidade);
  if (!Number.isFinite(quantidade) || quantidade < 0) {
    return res.status(400).json({ erro: "Quantidade invalida" });
  }

  const result = await db.prepare(
    "UPDATE estoque SET quantidade = ? WHERE id = ? AND empresa_id = ?",
  ).run(quantidade, req.params.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Item nao encontrado" });
  return res.json({ ok: true });
});

module.exports = router;
