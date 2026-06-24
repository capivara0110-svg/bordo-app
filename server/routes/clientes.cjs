const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico", "marinharia"],
});

function clean(value) {
  return String(value || "").trim();
}

async function getCliente(id, empresaId) {
  return db.prepare(
    "SELECT * FROM clientes WHERE id = ? AND empresa_id = ?",
  ).get(id, empresaId);
}

router.get("/", auth, async (req, res) => {
  const clientes = await db.prepare(
    "SELECT * FROM clientes WHERE empresa_id = ? ORDER BY nome",
  ).all(req.usuario.empresa_id);
  return res.json(clientes);
});

router.get("/:id/historico", auth, async (req, res) => {
  const cliente = await getCliente(req.params.id, req.usuario.empresa_id);
  if (!cliente) return res.status(404).json({ erro: "Cliente nao encontrado" });

  const embarcacoes = await db.prepare(
    "SELECT * FROM embarcacoes WHERE cliente_id = ? AND empresa_id = ? ORDER BY nome",
  ).all(req.params.id, req.usuario.empresa_id);
  const ordens = await db.prepare(
    `SELECT * FROM ordens_servico
     WHERE cliente_id = ? AND empresa_id = ?
     ORDER BY criado_em DESC, id DESC`,
  ).all(req.params.id, req.usuario.empresa_id);

  return res.json({ cliente, embarcacoes, ordens });
});

router.post("/", auth, canManage, async (req, res) => {
  const nome = clean(req.body.nome);
  if (!nome) return res.status(400).json({ erro: "Nome obrigatorio" });

  const result = await db.prepare(
    `INSERT INTO clientes
     (empresa_id,nome,documento,telefone,email,observacao)
     VALUES (?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    nome,
    clean(req.body.documento),
    clean(req.body.telefone),
    clean(req.body.email).toLowerCase(),
    clean(req.body.observacao),
  );

  return res.status(201).json(await getCliente(result.lastInsertRowid, req.usuario.empresa_id));
});

router.put("/:id", auth, canManage, async (req, res) => {
  const current = await getCliente(req.params.id, req.usuario.empresa_id);
  if (!current) return res.status(404).json({ erro: "Cliente nao encontrado" });

  const nome = clean(req.body.nome ?? current.nome);
  if (!nome) return res.status(400).json({ erro: "Nome obrigatorio" });

  await db.prepare(
    `UPDATE clientes
     SET nome = ?, documento = ?, telefone = ?, email = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    nome,
    clean(req.body.documento ?? current.documento),
    clean(req.body.telefone ?? current.telefone),
    clean(req.body.email ?? current.email).toLowerCase(),
    clean(req.body.observacao ?? current.observacao),
    req.params.id,
    req.usuario.empresa_id,
  );

  return res.json(await getCliente(req.params.id, req.usuario.empresa_id));
});

module.exports = router;
