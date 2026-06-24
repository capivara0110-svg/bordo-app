const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");
const allowedAvailability = ["disponivel", "ocupado", "folga", "indisponivel"];

function clean(value) {
  return String(value || "").trim();
}

async function getMembro(id, empresaId) {
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId <= 0) return null;
  return db.prepare(
    "SELECT * FROM tripulacao WHERE id = ? AND empresa_id = ?",
  ).get(memberId, empresaId);
}

router.get("/", auth, async (req, res) => {
  const membros = await db.prepare(
    "SELECT * FROM tripulacao WHERE empresa_id = ? ORDER BY nome",
  ).all(req.usuario.empresa_id);
  return res.json(membros);
});

router.post("/", auth, canManage, async (req, res) => {
  const { avatar } = req.body;
  const nome = clean(req.body.nome);
  const cargo = clean(req.body.cargo || req.body.funcao);
  const funcao = clean(req.body.funcao || cargo);
  const disponibilidade = allowedAvailability.includes(req.body.disponibilidade)
    ? req.body.disponibilidade
    : "disponivel";
  if (!nome || !cargo) {
    return res.status(400).json({ erro: "Nome e funcao obrigatorios" });
  }

  const result = await db.prepare(
    `INSERT INTO tripulacao
     (empresa_id,nome,cargo,funcao,telefone,disponibilidade,habilitacao,certificado,avatar,observacao,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    nome,
    cargo,
    funcao,
    clean(req.body.telefone),
    disponibilidade,
    clean(req.body.habilitacao),
    clean(req.body.certificado),
    avatar || "TRI",
    clean(req.body.observacao),
    disponibilidade === "disponivel" ? "ok" : disponibilidade,
  );

  return res.status(201).json(await getMembro(result.lastInsertRowid, req.usuario.empresa_id));
});

router.put("/:id", auth, canManage, async (req, res) => {
  const current = await getMembro(req.params.id, req.usuario.empresa_id);
  if (!current) return res.status(404).json({ erro: "Tripulante nao encontrado" });

  const nome = clean(req.body.nome ?? current.nome);
  const cargo = clean(req.body.cargo ?? current.cargo);
  const funcao = clean(req.body.funcao ?? current.funcao ?? cargo);
  const disponibilidade = allowedAvailability.includes(req.body.disponibilidade)
    ? req.body.disponibilidade
    : current.disponibilidade || "disponivel";
  const status = req.body.status || (disponibilidade === "disponivel" ? "ok" : disponibilidade);

  await db.prepare(
    `UPDATE tripulacao
     SET nome = ?, cargo = ?, funcao = ?, telefone = ?, disponibilidade = ?,
         habilitacao = ?, certificado = ?, status = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    nome,
    cargo,
    funcao,
    clean(req.body.telefone ?? current.telefone),
    disponibilidade,
    clean(req.body.habilitacao ?? current.habilitacao),
    clean(req.body.certificado ?? current.certificado),
    status,
    clean(req.body.observacao ?? current.observacao),
    req.params.id,
    req.usuario.empresa_id,
  );

  return res.json(await getMembro(req.params.id, req.usuario.empresa_id));
});

module.exports = router;
