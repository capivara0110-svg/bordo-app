const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

const defaultChecklist = [
  ["Seguranca", "Coletes disponiveis para todos e em bom estado"],
  ["Seguranca", "Extintores no lugar, carregados e dentro da validade"],
  ["Seguranca", "Boia, cabo, kit primeiros socorros e sinalizadores acessiveis"],
  ["Pre-servico", "OS lida: embarcacao, local, escopo e prioridade conferidos"],
  ["Pre-servico", "Area isolada/protegida antes de iniciar o trabalho"],
  ["Pre-servico", "Ferramentas, EPIs e material principal separados"],
  ["Motor e eletrica", "Porão/casa de maquinas sem agua, oleo solto ou cheiro forte"],
  ["Motor e eletrica", "Baterias, chave geral e cabos sem aquecimento ou folga aparente"],
  ["Motor e eletrica", "Nivel de oleo, refrigeracao e vazamentos visiveis conferidos"],
  ["Limpeza e acabamento", "Produto correto separado para casco, conves, inox ou estofado"],
  ["Limpeza e acabamento", "Ralos, drenos e pontos de escoamento desobstruidos"],
  ["Limpeza e acabamento", "Acabamento final conferido sem manchas, riscos ou resíduo"],
  ["Evidencias", "Foto antes do servico anexada quando fizer sentido"],
  ["Evidencias", "Foto durante/depois anexada para mostrar execucao"],
  ["Evidencias", "Material usado, pendencia ou avaria registrado em observacao"],
  ["Encerramento", "Ferramentas recolhidas e area limpa"],
  ["Encerramento", "Checklist da OS concluido ou pendencias explicadas"],
  ["Encerramento", "Gestor avisado quando houver risco, falta de material ou atraso"],
];

async function ensureDefaultChecklist(usuario) {
  for (const [categoria, item] of defaultChecklist) {
    const existing = await db.prepare(
      `SELECT id FROM checklist
       WHERE empresa_id = ? AND usuario_id = ? AND categoria = ? AND item = ?
       LIMIT 1`,
    ).get(usuario.empresa_id, usuario.id, categoria, item);
    if (!existing) {
      await db.prepare(
        `INSERT INTO checklist (empresa_id,usuario_id,categoria,item,feito)
         VALUES (?,?,?,?,0)`,
      ).run(usuario.empresa_id, usuario.id, categoria, item);
    }
  }
}

router.get("/", auth, async (req, res) => {
  await ensureDefaultChecklist(req.usuario);
  const itens = await db.prepare(
    `SELECT * FROM checklist
     WHERE empresa_id = ? AND usuario_id = ?
     ORDER BY categoria, id`,
  ).all(req.usuario.empresa_id, req.usuario.id);
  return res.json(itens);
});

router.put("/:id/toggle", auth, async (req, res) => {
  const item = await db.prepare(
    `SELECT feito FROM checklist
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).get(req.params.id, req.usuario.empresa_id, req.usuario.id);
  if (!item) return res.status(404).json({ erro: "Item nao encontrado" });

  await db.prepare(
    `UPDATE checklist SET feito = ?
     WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
  ).run(item.feito ? 0 : 1, req.params.id, req.usuario.empresa_id, req.usuario.id);
  return res.json({ ok: true });
});

router.post("/", auth, async (req, res) => {
  const { categoria, item } = req.body;
  if (!categoria || !item) {
    return res.status(400).json({ erro: "Categoria e item obrigatorios" });
  }

  const result = await db.prepare(
    `INSERT INTO checklist (empresa_id,usuario_id,categoria,item)
     VALUES (?,?,?,?)`,
  ).run(req.usuario.empresa_id, req.usuario.id, categoria, item);

  return res.status(201).json({
    id: result.lastInsertRowid,
    categoria,
    item,
    feito: 0,
  });
});

module.exports = router;
