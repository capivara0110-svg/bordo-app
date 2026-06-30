const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canViewProductivity = requireAccess({
  roles: ["proprietario", "gestor"],
  profiles: ["gestor"],
});

async function count(sql, empresaId, ...params) {
  const row = await db.prepare(sql).get(empresaId, ...params);
  return Number(row.total);
}

router.get("/", auth, async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const [
    totalOS,
    osAtivas,
    totalBercos,
    bercosOcupados,
    totalEquipe,
    totalEstoque,
    estoqueBaixo,
    notificacoesNaoLidas,
  ] = await Promise.all([
    count("SELECT COUNT(*) AS total FROM ordens_servico WHERE empresa_id = ?", empresaId),
    count("SELECT COUNT(*) AS total FROM ordens_servico WHERE empresa_id = ? AND status != 'concluida'", empresaId),
    count("SELECT COUNT(*) AS total FROM bercos WHERE empresa_id = ?", empresaId),
    count("SELECT COUNT(*) AS total FROM bercos WHERE empresa_id = ? AND status = 'ocupado'", empresaId),
    count("SELECT COUNT(*) AS total FROM tripulacao WHERE empresa_id = ?", empresaId),
    count("SELECT COUNT(*) AS total FROM estoque WHERE empresa_id = ?", empresaId),
    count("SELECT COUNT(*) AS total FROM estoque WHERE empresa_id = ? AND quantidade < minimo", empresaId),
    count(
      "SELECT COUNT(*) AS total FROM notificacoes WHERE empresa_id = ? AND usuario_id = ? AND lida = 0",
      empresaId,
      req.usuario.id,
    ),
  ]);

  const ultimasOS = await db.prepare(
    `SELECT * FROM ordens_servico
     WHERE empresa_id = ?
     ORDER BY criado_em DESC LIMIT 5`,
  ).all(empresaId);

  return res.json({
    os: { total: totalOS, ativas: osAtivas },
    bercos: { total: totalBercos, ocupados: bercosOcupados },
    equipe: { total: totalEquipe },
    estoque: { total: totalEstoque, baixo: estoqueBaixo },
    notificacoes: { naoLidas: notificacoesNaoLidas },
    ultimasOS,
  });
});

router.get("/produtividade", auth, canViewProductivity, async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const dias = Math.min(Math.max(Number(req.query.dias) || 30, 1), 180);
  const desde = new Date(Date.now() - dias * 86400000).toISOString();

  const [membros, ordens, auxiliares, tarefas, fotos, execucoes] = await Promise.all([
    db.prepare(
      `SELECT id, nome, cargo, funcao, disponibilidade, status, avatar
       FROM tripulacao
       WHERE empresa_id = ?
       ORDER BY nome`,
    ).all(empresaId),
    db.prepare(
      `SELECT id, codigo, embarcacao, cliente, tipo, status, responsavel_id, responsavel, criado_em
       FROM ordens_servico
       WHERE empresa_id = ?
       ORDER BY criado_em DESC`,
    ).all(empresaId),
    db.prepare(
      `SELECT os_id, membro_id, nome
       FROM os_auxiliares
       WHERE empresa_id = ?`,
    ).all(empresaId),
    db.prepare(
      `SELECT os.id AS os_id,
              SUM(CASE WHEN t.done = 1 THEN 1 ELSE 0 END) AS feitas,
              COUNT(t.id) AS total
       FROM ordens_servico os
       LEFT JOIN os_tarefas t ON t.os_id = os.id
       WHERE os.empresa_id = ?
       GROUP BY os.id`,
    ).all(empresaId),
    db.prepare(
      `SELECT referencia_id AS os_id, COUNT(*) AS total
       FROM fotos
       WHERE empresa_id = ? AND tipo = 'ordem' AND criado_em >= ?
       GROUP BY referencia_id`,
    ).all(empresaId, desde),
    db.prepare(
      `SELECT e.*, os.codigo, os.embarcacao, os.cliente
       FROM os_execucoes e
       JOIN ordens_servico os ON os.id = e.os_id AND os.empresa_id = e.empresa_id
       WHERE e.empresa_id = ? AND e.criado_em >= ?
       ORDER BY e.criado_em DESC, e.id DESC
       LIMIT 80`,
    ).all(empresaId, desde),
  ]);

  const auxiliaresPorOrdem = new Map();
  for (const auxiliar of auxiliares) {
    const list = auxiliaresPorOrdem.get(Number(auxiliar.os_id)) || [];
    list.push(auxiliar);
    auxiliaresPorOrdem.set(Number(auxiliar.os_id), list);
  }

  const tarefasPorOrdem = new Map(tarefas.map((item) => [
    Number(item.os_id),
    { feitas: Number(item.feitas || 0), total: Number(item.total || 0) },
  ]));
  const fotosPorOrdem = new Map(fotos.map((item) => [Number(item.os_id), Number(item.total || 0)]));

  const membrosProdutividade = membros.map((membro) => {
    const nome = clean(membro.nome).toLowerCase();
    const ordensDoMembro = ordens.filter((ordem) => {
      if (Number(ordem.responsavel_id) === Number(membro.id)) return true;
      if (clean(ordem.responsavel).toLowerCase() === nome) return true;
      return (auxiliaresPorOrdem.get(Number(ordem.id)) || []).some((auxiliar) => (
        Number(auxiliar.membro_id) === Number(membro.id)
        || clean(auxiliar.nome).toLowerCase() === nome
      ));
    });

    const execucoesDoMembro = execucoes.filter((execucao) => (
      Number(execucao.membro_id) === Number(membro.id)
      || clean(execucao.autor).toLowerCase() === nome
    ));

    const ordemIds = new Set(ordensDoMembro.map((ordem) => Number(ordem.id)));
    const tarefasFeitas = [...ordemIds].reduce((total, osId) => total + (tarefasPorOrdem.get(osId)?.feitas || 0), 0);
    const tarefasTotal = [...ordemIds].reduce((total, osId) => total + (tarefasPorOrdem.get(osId)?.total || 0), 0);
    const fotosTotal = [...ordemIds].reduce((total, osId) => total + (fotosPorOrdem.get(osId) || 0), 0);
    const ultimaExecucao = execucoesDoMembro[0]?.criado_em || "";
    const ultimaOrdem = ordensDoMembro[0]?.criado_em || "";

    return {
      id: membro.id,
      nome: membro.nome,
      funcao: membro.funcao || membro.cargo || "",
      status: membro.status || membro.disponibilidade || "ok",
      avatar: membro.avatar || "",
      ordens_atribuidas: ordensDoMembro.length,
      ordens_abertas: ordensDoMembro.filter((ordem) => !["concluida", "cancelada"].includes(ordem.status)).length,
      ordens_concluidas: ordensDoMembro.filter((ordem) => ordem.status === "concluida").length,
      tarefas_feitas: tarefasFeitas,
      tarefas_total: tarefasTotal,
      fotos: fotosTotal,
      execucoes: execucoesDoMembro.length,
      ultima_atividade: maxDate(ultimaExecucao, ultimaOrdem),
    };
  }).sort((a, b) => (
    b.execucoes - a.execucoes
    || b.tarefas_feitas - a.tarefas_feitas
    || b.ordens_atribuidas - a.ordens_atribuidas
  ));

  return res.json({
    periodo_dias: dias,
    desde,
    resumo: {
      colaboradores: membros.length,
      ordens_abertas: ordens.filter((ordem) => !["concluida", "cancelada"].includes(ordem.status)).length,
      ordens_concluidas: ordens.filter((ordem) => ordem.status === "concluida").length,
      execucoes: execucoes.length,
      fotos: fotos.reduce((total, item) => total + Number(item.total || 0), 0),
    },
    membros: membrosProdutividade,
    atividades: execucoes.slice(0, 30).map((execucao) => ({
      id: execucao.id,
      os_id: execucao.os_id,
      codigo: execucao.codigo,
      embarcacao: execucao.embarcacao,
      cliente: execucao.cliente,
      autor: execucao.autor,
      descricao: execucao.descricao,
      criado_em: execucao.criado_em,
    })),
  });
});

function clean(value) {
  return String(value || "").trim();
}

function maxDate(first, second) {
  if (!first) return second || "";
  if (!second) return first || "";
  return new Date(first).getTime() >= new Date(second).getTime() ? first : second;
}

module.exports = router;
