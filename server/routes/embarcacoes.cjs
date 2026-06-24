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

async function getEmbarcacao(id, empresaId) {
  return db.prepare(
    `SELECT e.*, c.nome AS cliente_nome
     FROM embarcacoes e
     LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
     WHERE e.id = ? AND e.empresa_id = ?`,
  ).get(id, empresaId);
}

async function validClientId(value, empresaId) {
  const id = Number(value) || null;
  if (!id) return null;
  const cliente = await db.prepare(
    "SELECT id FROM clientes WHERE id = ? AND empresa_id = ?",
  ).get(id, empresaId);
  return cliente ? id : null;
}

router.get("/", auth, async (req, res) => {
  const embarcacoes = await db.prepare(
    `SELECT e.*, c.nome AS cliente_nome
     FROM embarcacoes e
     LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
     WHERE e.empresa_id = ?
     ORDER BY e.nome`,
  ).all(req.usuario.empresa_id);
  return res.json(embarcacoes);
});

router.post("/", auth, canManage, async (req, res) => {
  const nome = clean(req.body.nome);
  if (!nome) return res.status(400).json({ erro: "Nome da embarcacao obrigatorio" });

  const clienteId = await validClientId(req.body.cliente_id, req.usuario.empresa_id);
  const result = await db.prepare(
    `INSERT INTO embarcacoes
     (empresa_id,cliente_id,nome,tipo,marca,modelo,tamanho,registro,observacao)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    clienteId,
    nome,
    clean(req.body.tipo),
    clean(req.body.marca),
    clean(req.body.modelo),
    clean(req.body.tamanho),
    clean(req.body.registro),
    clean(req.body.observacao),
  );

  return res.status(201).json(await getEmbarcacao(result.lastInsertRowid, req.usuario.empresa_id));
});

router.put("/:id", auth, canManage, async (req, res) => {
  const current = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  if (!current) return res.status(404).json({ erro: "Embarcacao nao encontrada" });

  const nome = clean(req.body.nome ?? current.nome);
  if (!nome) return res.status(400).json({ erro: "Nome da embarcacao obrigatorio" });
  const clienteId = Object.prototype.hasOwnProperty.call(req.body, "cliente_id")
    ? await validClientId(req.body.cliente_id, req.usuario.empresa_id)
    : current.cliente_id;

  await db.prepare(
    `UPDATE embarcacoes
     SET cliente_id = ?, nome = ?, tipo = ?, marca = ?, modelo = ?,
         tamanho = ?, registro = ?, observacao = ?
     WHERE id = ? AND empresa_id = ?`,
  ).run(
    clienteId,
    nome,
    clean(req.body.tipo ?? current.tipo),
    clean(req.body.marca ?? current.marca),
    clean(req.body.modelo ?? current.modelo),
    clean(req.body.tamanho ?? current.tamanho),
    clean(req.body.registro ?? current.registro),
    clean(req.body.observacao ?? current.observacao),
    req.params.id,
    req.usuario.empresa_id,
  );

  return res.json(await getEmbarcacao(req.params.id, req.usuario.empresa_id));
});

module.exports = router;
