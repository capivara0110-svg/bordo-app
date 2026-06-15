const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");

router.get("/", auth, async (req, res) => {
  const membros = await db.prepare(
    "SELECT * FROM tripulacao WHERE empresa_id = ? ORDER BY nome",
  ).all(req.usuario.empresa_id);
  return res.json(membros);
});

router.post("/", auth, canManage, async (req, res) => {
  const { nome, cargo, habilitacao, certificado, avatar } = req.body;
  if (!nome || !cargo) {
    return res.status(400).json({ erro: "Nome e cargo obrigatorios" });
  }

  const result = await db.prepare(
    `INSERT INTO tripulacao
     (empresa_id,nome,cargo,habilitacao,certificado,avatar)
     VALUES (?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    nome,
    cargo,
    habilitacao || "",
    certificado || "",
    avatar || "TRI",
  );

  return res.status(201).json({ id: result.lastInsertRowid, nome, cargo });
});

router.put("/:id", auth, canManage, async (req, res) => {
  const { nome, cargo, habilitacao, certificado, status } = req.body;
  const result = await db.prepare(
    `UPDATE tripulacao
     SET nome = ?, cargo = ?, habilitacao = ?, certificado = ?, status = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    nome,
    cargo,
    habilitacao,
    certificado,
    status,
    req.params.id,
    req.usuario.empresa_id,
  );

  if (!result.changes) return res.status(404).json({ erro: "Tripulante nao encontrado" });
  return res.json({ ok: true });
});

module.exports = router;
