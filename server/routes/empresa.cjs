const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireRoles } = require("../middleware.cjs");
const { getResumoPlano, requireLimite } = require("../planos.cjs");

const router = express.Router();
const canManage = requireRoles("proprietario", "gestor");
const JWT_SECRET = process.env.JWT_SECRET || "bordo-secret-key-2026";
const validRoles = ["gestor", "tecnico", "membro"];
const validProfiles = ["gestor", "tecnico", "marinharia", "marinheiro"];

function clean(value) {
  return String(value || "").trim();
}

function publicInvite(row) {
  if (!row) return null;
  return {
    token: row.token,
    nome: row.nome || "",
    email: row.email || "",
    perfil: row.perfil,
    papel: row.papel,
    cargo: row.cargo || "",
    usado: Number(row.usado || 0),
    expira_em: row.expira_em,
    empresa_nome: row.empresa_nome,
  };
}

function inviteLink(req, token) {
  const baseUrl = process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/convite/${token}`;
}

async function ensureOperationalMember(empresaId, nome, cargo, avatar) {
  const cleanName = clean(nome);
  const cleanCargo = clean(cargo) || "Colaborador";
  if (!cleanName) return null;

  const current = await db.prepare(
    `SELECT id FROM tripulacao
     WHERE empresa_id = ? AND lower(nome) = lower(?)
     ORDER BY id
     LIMIT 1`,
  ).get(empresaId, cleanName);
  if (current) {
    await db.prepare(
      `UPDATE tripulacao
       SET cargo = ?, funcao = ?, disponibilidade = 'disponivel', status = 'ok'
       WHERE id = ? AND empresa_id = ?`,
    ).run(cleanCargo, cleanCargo, current.id, empresaId);
    return current.id;
  }

  const result = await db.prepare(
    `INSERT INTO tripulacao
     (empresa_id,nome,cargo,funcao,disponibilidade,status,avatar,observacao)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    empresaId,
    cleanName,
    cleanCargo,
    cleanCargo,
    "disponivel",
    "ok",
    avatar || cleanName.slice(0, 3).toUpperCase(),
    "Criado a partir do acesso de colaborador",
  );
  return result.lastInsertRowid;
}

router.get("/", auth, async (req, res) => {
  const empresa = await db.prepare(
    "SELECT id, nome, slug, plano, ativo, trial_termina_em, criado_em FROM empresas WHERE id = ?",
  ).get(req.usuario.empresa_id);
  return res.json({ ...empresa, assinatura: await getResumoPlano(req.usuario.empresa_id) });
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

router.get("/convites", auth, canManage, async (req, res) => {
  const convites = await db.prepare(
    `SELECT c.*, u.nome AS criado_por_nome
     FROM convites_colaboradores c
     LEFT JOIN usuarios u ON u.id = c.criado_por
     WHERE c.empresa_id = ?
     ORDER BY c.criado_em DESC, c.id DESC
     LIMIT 20`,
  ).all(req.usuario.empresa_id);
  return res.json(convites.map((convite) => ({
    ...convite,
    link: inviteLink(req, convite.token),
  })));
});

router.post("/convites", auth, canManage, requireLimite("usuarios"), async (req, res) => {
  const nome = clean(req.body.nome).slice(0, 120);
  const email = clean(req.body.email).toLowerCase().slice(0, 160);
  const papel = validRoles.includes(req.body.papel) ? req.body.papel : "membro";
  const perfil = validProfiles.includes(req.body.perfil) ? req.body.perfil : "marinheiro";
  const cargo = clean(req.body.cargo).slice(0, 100);
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  if (email && await db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email)) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }

  const result = await db.prepare(
    `INSERT INTO convites_colaboradores
     (empresa_id,criado_por,token,nome,email,perfil,papel,cargo,expira_em)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(req.usuario.empresa_id, req.usuario.id, token, nome, email, perfil, papel, cargo, expiresAt);

  const convite = await db.prepare(
    `SELECT c.*, e.nome AS empresa_nome
     FROM convites_colaboradores c
     JOIN empresas e ON e.id = c.empresa_id
     WHERE c.id = ?`,
  ).get(result.lastInsertRowid);

  return res.status(201).json({ ...convite, link: inviteLink(req, token) });
});

router.get("/convites/:token/publico", async (req, res) => {
  const convite = await db.prepare(
    `SELECT c.*, e.nome AS empresa_nome
     FROM convites_colaboradores c
     JOIN empresas e ON e.id = c.empresa_id
     WHERE c.token = ?`,
  ).get(req.params.token);
  if (!convite) return res.status(404).json({ erro: "Convite nao encontrado" });
  if (Number(convite.usado)) return res.status(409).json({ erro: "Convite ja usado" });
  if (convite.expira_em && new Date(convite.expira_em).getTime() < Date.now()) {
    return res.status(410).json({ erro: "Convite expirado" });
  }
  return res.json(publicInvite(convite));
});

router.post("/convites/:token/aceitar", async (req, res) => {
  const convite = await db.prepare(
    `SELECT c.*, e.nome AS empresa_nome, e.plano AS empresa_plano, e.trial_termina_em AS empresa_trial_termina_em
     FROM convites_colaboradores c
     JOIN empresas e ON e.id = c.empresa_id
     WHERE c.token = ?`,
  ).get(req.params.token);

  if (!convite) return res.status(404).json({ erro: "Convite nao encontrado" });
  if (Number(convite.usado)) return res.status(409).json({ erro: "Convite ja usado" });
  if (convite.expira_em && new Date(convite.expira_em).getTime() < Date.now()) {
    return res.status(410).json({ erro: "Convite expirado" });
  }

  const nome = clean(req.body.nome || convite.nome).slice(0, 120);
  const email = clean(req.body.email || convite.email).toLowerCase().slice(0, 160);
  const senha = String(req.body.senha || "");
  if (!nome || !email || senha.length < 8) {
    return res.status(400).json({ erro: "Nome, email e senha com pelo menos 8 caracteres sao obrigatorios" });
  }
  if (convite.email && email !== convite.email) {
    return res.status(400).json({ erro: "Use o email informado no convite" });
  }
  if (await db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email)) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }

  const resumoPlano = await getResumoPlano(convite.empresa_id);
  if (!resumoPlano || !resumoPlano.ativo) {
    return res.status(402).json({
      erro: "Plano inativo ou periodo de teste expirado",
      codigo: "PLANO_INATIVO",
    });
  }
  const limiteUsuarios = resumoPlano.limites.usuarios;
  const usuariosUsados = resumoPlano.uso.usuarios;
  if (limiteUsuarios !== null && limiteUsuarios !== undefined && usuariosUsados >= limiteUsuarios) {
    return res.status(403).json({
      erro: "Limite do plano atingido",
      codigo: "LIMITE_PLANO",
      recurso: "usuarios",
      limite: limiteUsuarios,
      uso: usuariosUsados,
    });
  }

  const result = await db.prepare(
    `INSERT INTO usuarios
     (empresa_id,nome,email,senha,perfil,papel,avatar,cargo)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    convite.empresa_id,
    nome,
    email,
    bcrypt.hashSync(senha, 12),
    convite.perfil || "marinheiro",
    convite.papel || "membro",
    (convite.perfil || "mar").slice(0, 3).toUpperCase(),
    convite.cargo || "",
  );

  await db.prepare(
    "UPDATE convites_colaboradores SET usado = 1, usado_por = ? WHERE id = ?",
  ).run(result.lastInsertRowid, convite.id);

  const user = await db.prepare(
    `SELECT u.*, e.nome AS empresa_nome, e.plano AS empresa_plano,
            e.trial_termina_em AS empresa_trial_termina_em
     FROM usuarios u
     JOIN empresas e ON e.id = u.empresa_id
     WHERE u.id = ?`,
  ).get(result.lastInsertRowid);

  await ensureOperationalMember(user.empresa_id, user.nome, user.cargo || user.perfil, user.avatar);

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  const { senha: _senha, ...safeUser } = user;
  return res.status(201).json({ token, user: safeUser });
});

router.post("/membros", auth, canManage, requireLimite("usuarios"), async (req, res) => {
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

  await ensureOperationalMember(
    req.usuario.empresa_id,
    nome,
    cargo || profileLabelsForServer(perfil),
    perfil.slice(0, 3).toUpperCase(),
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

function profileLabelsForServer(perfil) {
  const labels = {
    gestor: "Gestao",
    tecnico: "Tecnico",
    marinharia: "Marinharia",
    marinheiro: "Marinheiro",
  };
  return labels[perfil] || "Colaborador";
}

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
