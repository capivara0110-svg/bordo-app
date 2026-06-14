const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database.cjs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "bordo-secret-key-2026";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Email e senha obrigatórios" });

  const user = await db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ erro: "Usuário não encontrado" });

  const senhaOk = bcrypt.compareSync(senha, user.senha);
  if (!senhaOk) return res.status(401).json({ erro: "Senha incorreta" });

  const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: "7d" });
  const { senha: _, ...userData } = user;

  res.json({ token, user: userData });
});

// POST /api/auth/registro
router.post("/registro", async (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: "Nome, email e senha obrigatórios" });

  const existe = await db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email);
  if (existe) return res.status(409).json({ erro: "Email já cadastrado" });

  const hash = bcrypt.hashSync(senha, 10);
  const avatarMap = { marinheiro: "MAR", marinharia: "MNH", tecnico: "TEC", gestor: "GST" };

  const result = await db.prepare(
    "INSERT INTO usuarios (nome, email, senha, perfil, avatar) VALUES (?, ?, ?, ?, ?)"
  ).run(nome, email, hash, perfil || "marinheiro", avatarMap[perfil] || "MAR");

  const token = jwt.sign({ id: result.lastInsertRowid, perfil: perfil || "marinheiro" }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, nome, email, perfil: perfil || "marinheiro", avatar: avatarMap[perfil] || "MAR" }
  });
});

// GET /api/auth/me - dados do usuário logado
router.get("/me", require("../middleware.cjs"), async (req, res) => {
  const user = await db.prepare("SELECT id, nome, email, perfil, avatar, cargo, embarcacao FROM usuarios WHERE id = ?").get(req.usuario.id);
  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
  res.json(user);
});

module.exports = router;
