const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");
const validRoles = ["gestor", "tecnico", "membro"];
const validProfiles = ["gestor", "tecnico", "marinharia", "marinheiro"];

router.get("/", auth, async (req, res) => {
  const empresa = await db.prepare(
    "SELECT id, nome, slug, plano, ativo, criado_em FROM empresas WHERE id = ?",
  ).get(req.usuario.empresa_id);
  return res.json(empresa);
});

router.get("/membros", auth, canManage, async (req, res) => {
  const membros = await db.prepare(
    `SELECT id, nome, email, perfil, papel, avatar, cargo, embarcacao, criado_em
     FROM usuarios
     WHERE empresa_id = ?
     ORDER BY nome`,
  ).all(req.usuario.empresa_id);
  return res.json(membros);
});

router.post("/membros", auth, canManage, async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  const papel = validRoles.includes(req.body.papel) ? req.body.papel : "membro";
  const perfil = validProfiles.includes(req.body.perfil) ? req.body.perfil : "marinheiro";
  const cargo = String(req.body.cargo || "").trim();

  if (!nome || !email || senha.length < 8) {
    return res.status(400).json({
      erro: "Nome, email e senha com pelo menos 8 caracteres sao obrigatorios",
    });
  }
  if (await db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email)) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }

  const result = await db.prepare(
    `INSERT INTO usuarios
     (empresa_id,nome,email,senha,perfil,papel,avatar,cargo)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    nome,
    email,
    bcrypt.hashSync(senha, 12),
    perfil,
    papel,
    perfil.slice(0, 3).toUpperCase(),
    cargo,
  );

  return res.status(201).json({
    id: result.lastInsertRowid,
    nome,
    email,
    perfil,
    papel,
    cargo,
  });
});

router.put("/membros/:id/papel", auth, canManage, async (req, res) => {
  const papel = req.body.papel;
  if (!validRoles.includes(papel)) {
    return res.status(400).json({ erro: "Papel invalido" });
  }
  if (Number(req.params.id) === Number(req.usuario.id)) {
    return res.status(400).json({ erro: "Voce nao pode alterar seu proprio papel" });
  }

  const result = await db.prepare(
    `UPDATE usuarios SET papel = ?
     WHERE id = ? AND empresa_id = ? AND papel != 'proprietario'`,
  ).run(papel, req.params.id, req.usuario.empresa_id);

  if (!result.changes) return res.status(404).json({ erro: "Membro nao encontrado" });
  return res.json({ ok: true });
});

module.exports = router;
