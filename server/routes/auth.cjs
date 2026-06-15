const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { trialEndsAt } = require("../planos.cjs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "bordo-secret-key-2026";

function createToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  const { senha, ...safeUser } = user;
  return safeUser;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "empresa";
}

async function uniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (await db.prepare("SELECT id FROM empresas WHERE slug = ?").get(slug)) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha obrigatorios" });
  }

  const user = await db.prepare(
    `SELECT u.*, e.nome AS empresa_nome, e.plano AS empresa_plano,
            e.ativo AS empresa_ativa, e.trial_termina_em AS empresa_trial_termina_em
     FROM usuarios u
     JOIN empresas e ON e.id = u.empresa_id
     WHERE u.email = ?`,
  ).get(email);

  if (!user || !bcrypt.compareSync(senha, user.senha)) {
    return res.status(401).json({ erro: "Email ou senha incorretos" });
  }
  if (!Number(user.empresa_ativa)) {
    return res.status(403).json({ erro: "Empresa desativada" });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
});

router.post("/registro", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const nomeEmpresa = String(req.body.nome_empresa || req.body.nomeEmpresa || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");

  if (!nome || !nomeEmpresa || !email || !senha) {
    return res.status(400).json({
      erro: "Nome, empresa, email e senha sao obrigatorios",
    });
  }
  if (senha.length < 8) {
    return res.status(400).json({ erro: "A senha deve ter pelo menos 8 caracteres" });
  }
  if (await db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email)) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }

  const slug = await uniqueSlug(nomeEmpresa);
  const empresaResult = await db.prepare(
    "INSERT INTO empresas (nome, slug, plano, trial_termina_em) VALUES (?, ?, ?, ?)",
  ).run(nomeEmpresa, slug, "trial", trialEndsAt());

  try {
    const hash = bcrypt.hashSync(senha, 12);
    const userResult = await db.prepare(
      `INSERT INTO usuarios
       (empresa_id,nome,email,senha,perfil,papel,avatar,cargo)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).run(
      empresaResult.lastInsertRowid,
      nome,
      email,
      hash,
      "gestor",
      "proprietario",
      "GST",
      "Proprietario",
    );

    const user = await db.prepare(
      `SELECT u.*, e.nome AS empresa_nome, e.plano AS empresa_plano,
              e.trial_termina_em AS empresa_trial_termina_em
       FROM usuarios u JOIN empresas e ON e.id = u.empresa_id
       WHERE u.id = ?`,
    ).get(userResult.lastInsertRowid);

    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    await db.prepare("DELETE FROM empresas WHERE id = ?").run(empresaResult.lastInsertRowid);
    throw error;
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await db.prepare(
    `SELECT u.id, u.empresa_id, u.nome, u.email, u.perfil, u.papel,
            u.avatar, u.cargo, u.embarcacao,
            e.nome AS empresa_nome, e.slug AS empresa_slug, e.plano AS empresa_plano,
            e.trial_termina_em AS empresa_trial_termina_em
     FROM usuarios u
     JOIN empresas e ON e.id = u.empresa_id
     WHERE u.id = ?`,
  ).get(req.usuario.id);

  return res.json(user);
});

module.exports = router;
