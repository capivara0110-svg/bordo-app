const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

function hasFullAgendaAccess(usuario) {
  return ["proprietario", "gestor"].includes(usuario.papel) || usuario.perfil === "gestor";
}

async function getUsuarioMembro(usuario) {
  return db.prepare(
    `SELECT id, nome, funcao, cargo
     FROM tripulacao
     WHERE empresa_id = ? AND lower(nome) = lower(?)
     ORDER BY id
     LIMIT 1`,
  ).get(usuario.empresa_id, usuario.nome);
}

async function getAuxiliares(osId, empresaId) {
  return db.prepare(
    `SELECT id, membro_id, nome, funcao
     FROM os_auxiliares
     WHERE os_id = ? AND empresa_id = ?
     ORDER BY nome`,
  ).all(osId, empresaId);
}

router.get("/", auth, async (req, res) => {
  const ordens = await db.prepare(
    `SELECT id, codigo, embarcacao, cliente, tipo, prioridade, status,
            descricao, responsavel, responsavel_id, previsao, criado_em
     FROM ordens_servico
     WHERE empresa_id = ? AND previsao != '' AND status != 'cancelada'
     ORDER BY previsao ASC, criado_em DESC`,
  ).all(req.usuario.empresa_id);

  const membro = hasFullAgendaAccess(req.usuario) ? null : await getUsuarioMembro(req.usuario);
  const result = [];

  for (const ordem of ordens) {
    const auxiliares = await getAuxiliares(ordem.id, req.usuario.empresa_id);
    const isResponsavel = membro && Number(ordem.responsavel_id) === Number(membro.id);
    const isAuxiliar = membro && auxiliares.some((auxiliar) => Number(auxiliar.membro_id) === Number(membro.id));
    const isResponsavelManual = String(ordem.responsavel || "").trim().toLowerCase() === String(req.usuario.nome || "").trim().toLowerCase();

    if (hasFullAgendaAccess(req.usuario) || isResponsavel || isAuxiliar || isResponsavelManual) {
      result.push({ ...ordem, auxiliares });
    }
  }

  return res.json(result);
});

module.exports = router;
