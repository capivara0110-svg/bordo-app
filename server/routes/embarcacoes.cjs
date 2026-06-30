const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");
const { audit } = require("../audit.cjs");

const router = express.Router();
const canManage = requireAccess({
  roles: ["proprietario", "gestor", "tecnico"],
  profiles: ["gestor", "tecnico", "marinharia"],
});
const allowedPhotoCategories = ["geral", "antes", "durante", "depois", "documento"];

function clean(value) {
  return String(value || "").trim();
}

function dateKey(value) {
  return clean(value).slice(0, 10);
}

function daysUntil(value) {
  if (!value) return null;
  const date = new Date(`${dateKey(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

async function ensureQrToken(embarcacao) {
  if (embarcacao.qr_token) return embarcacao.qr_token;
  const token = crypto.randomBytes(18).toString("hex");
  await db.prepare(
    "UPDATE embarcacoes SET qr_token = ? WHERE id = ? AND empresa_id = ?",
  ).run(token, embarcacao.id, embarcacao.empresa_id);
  return token;
}

function cleanPhotoPayload(body) {
  const url = clean(body.url);
  if (!url) return { erro: "Foto obrigatoria" };
  if (!url.startsWith("data:image/") && !/^https?:\/\//i.test(url)) {
    return { erro: "Formato de foto invalido" };
  }
  if (url.length > 750000) return { erro: "Foto muito grande" };
  const categoria = allowedPhotoCategories.includes(body.categoria) ? body.categoria : "geral";
  const dataUrlMatch = url.match(/^data:([^;]+);base64,(.+)$/);
  const storageProvider = url.startsWith("data:image/") ? "data_url_mvp" : "external_url";
  return {
    url,
    categoria,
    legenda: clean(body.legenda).slice(0, 180),
    storage_provider: storageProvider,
    storage_key: storageProvider === "external_url" ? clean(body.storage_key).slice(0, 240) : "",
    mime_type: dataUrlMatch?.[1] || clean(body.mime_type).slice(0, 80),
    tamanho_bytes: dataUrlMatch?.[2] ? Math.ceil((dataUrlMatch[2].length * 3) / 4) : Number(body.tamanho_bytes) || 0,
  };
}

async function getEmbarcacao(id, empresaId) {
  const embarcacaoId = Number(id);
  if (!Number.isInteger(embarcacaoId) || embarcacaoId <= 0) return null;
  return db.prepare(
    `SELECT e.*, c.nome AS cliente_nome
     FROM embarcacoes e
     LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
     WHERE e.id = ? AND e.empresa_id = ?`,
  ).get(embarcacaoId, empresaId);
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

router.get("/alertas", auth, async (req, res) => {
  const embarcacoes = await db.prepare(
    `SELECT e.*, c.nome AS cliente_nome
     FROM embarcacoes e
     LEFT JOIN clientes c ON c.id = e.cliente_id AND c.empresa_id = e.empresa_id
     WHERE e.empresa_id = ?
     ORDER BY e.nome`,
  ).all(req.usuario.empresa_id);

  const alertas = [];
  for (const embarcacao of embarcacoes) {
    for (const [campo, titulo] of [
      ["proxima_manutencao", "Manutencao preventiva"],
      ["validade_documento", "Documento da embarcacao"],
    ]) {
      const dias = daysUntil(embarcacao[campo]);
      if (dias === null || dias > 30) continue;
      alertas.push({
        embarcacao_id: embarcacao.id,
        embarcacao: embarcacao.nome,
        cliente: embarcacao.cliente_nome || "",
        tipo: campo,
        titulo,
        data: embarcacao[campo],
        dias,
        status: dias < 0 ? "vencido" : dias <= 7 ? "urgente" : "atencao",
      });
    }
  }

  return res.json(alertas);
});

router.get("/:id/qrcode", auth, async (req, res) => {
  const embarcacao = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  if (!embarcacao) return res.status(404).json({ erro: "Embarcacao nao encontrada" });

  const token = await ensureQrToken(embarcacao);
  const baseUrl = process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/embarcacao/${token}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 220 });
  return res.json({ token, url, svg });
});

router.get("/:id/historico", auth, async (req, res) => {
  const embarcacao = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  if (!embarcacao) return res.status(404).json({ erro: "Embarcacao nao encontrada" });

  const ordens = await db.prepare(
    `SELECT * FROM ordens_servico
     WHERE embarcacao_id = ? AND empresa_id = ?
     ORDER BY criado_em DESC, id DESC`,
  ).all(req.params.id, req.usuario.empresa_id);

  return res.json({ embarcacao, ordens });
});

router.get("/:id/fotos", auth, async (req, res) => {
  const embarcacao = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  if (!embarcacao) return res.status(404).json({ erro: "Embarcacao nao encontrada" });

  const fotos = await db.prepare(
    `SELECT * FROM fotos
     WHERE tipo = 'embarcacao' AND referencia_id = ? AND empresa_id = ?
     ORDER BY criado_em DESC, id DESC`,
  ).all(req.params.id, req.usuario.empresa_id);
  return res.json(fotos);
});

router.post("/:id/fotos", auth, canManage, async (req, res) => {
  const embarcacao = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  if (!embarcacao) return res.status(404).json({ erro: "Embarcacao nao encontrada" });

  const foto = cleanPhotoPayload(req.body);
  if (foto.erro) return res.status(400).json({ erro: foto.erro });

  const result = await db.prepare(
    `INSERT INTO fotos
     (empresa_id,tipo,referencia_id,url,legenda,categoria,storage_provider,storage_key,mime_type,tamanho_bytes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario.empresa_id,
    "embarcacao",
    req.params.id,
    foto.url,
    foto.legenda,
    foto.categoria,
    foto.storage_provider,
    foto.storage_key,
    foto.mime_type,
    foto.tamanho_bytes,
  );

  return res.status(201).json({
    id: result.lastInsertRowid,
    empresa_id: req.usuario.empresa_id,
    tipo: "embarcacao",
    referencia_id: Number(req.params.id),
    ...foto,
  });
});

router.post("/", auth, canManage, async (req, res) => {
  const nome = clean(req.body.nome);
  if (!nome) return res.status(400).json({ erro: "Nome da embarcacao obrigatorio" });

  const clienteId = await validClientId(req.body.cliente_id, req.usuario.empresa_id);
  const result = await db.prepare(
    `INSERT INTO embarcacoes
     (empresa_id,cliente_id,nome,tipo,marca,modelo,tamanho,registro,observacao,proxima_manutencao,validade_documento,qr_token)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
    dateKey(req.body.proxima_manutencao),
    dateKey(req.body.validade_documento),
    crypto.randomBytes(18).toString("hex"),
  );

  const created = await getEmbarcacao(result.lastInsertRowid, req.usuario.empresa_id);
  await audit(req.usuario, "embarcacao", created.id, "criar", `Embarcacao ${created.nome} criada`, null, created);
  return res.status(201).json(created);
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
         tamanho = ?, registro = ?, observacao = ?, proxima_manutencao = ?, validade_documento = ?
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
    dateKey(req.body.proxima_manutencao ?? current.proxima_manutencao),
    dateKey(req.body.validade_documento ?? current.validade_documento),
    req.params.id,
    req.usuario.empresa_id,
  );

  const updated = await getEmbarcacao(req.params.id, req.usuario.empresa_id);
  await audit(req.usuario, "embarcacao", updated.id, "editar", `Embarcacao ${updated.nome} editada`, current, updated);
  return res.json(updated);
});

module.exports = router;
