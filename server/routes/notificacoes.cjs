const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();
const allowedChannels = ["app", "email", "whatsapp"];

router.get("/", auth, async (req, res) => {
  const notifications = await db.prepare(
    `SELECT * FROM notificacoes
     WHERE empresa_id = ? AND usuario_id = ?
     ORDER BY criado_em DESC`,
  ).all(req.usuario.empresa_id, req.usuario.id);
  return res.json(notifications);
});

router.put("/:id/ler", auth, async (req, res) => {
  const result = await db.prepare(
    `UPDATE notificacoes SET lida = 1
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).run(req.params.id, req.usuario.empresa_id, req.usuario.id);

  if (!result.changes) return res.status(404).json({ erro: "Notificacao nao encontrada" });
  return res.json({ ok: true });
});

router.post("/", auth, async (req, res) => {
  const { tipo, icone, titulo, corpo, acao, categoria, destinatario } = req.body;
  if (!titulo) return res.status(400).json({ erro: "Titulo obrigatorio" });
  const canal = allowedChannels.includes(req.body.canal) ? req.body.canal : "app";

  const result = await db.prepare(
    `INSERT INTO notificacoes
     (empresa_id,usuario_id,tipo,icone,titulo,corpo,acao,categoria,canal,destinatario,status_envio)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    req.usuario.id,
    tipo || "info",
    icone || "!",
    titulo,
    corpo || "",
    acao || "",
    categoria || "geral",
    canal,
    destinatario || "",
    canal === "app" ? "entregue" : "pendente_integracao",
  );

  return res.status(201).json({ id: result.lastInsertRowid, titulo, canal });
});

module.exports = router;
