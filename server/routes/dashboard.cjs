const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

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

module.exports = router;
