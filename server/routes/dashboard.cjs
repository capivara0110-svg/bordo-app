const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/dashboard - dados consolidados para o gestor
router.get("/", auth, async (req, res) => {
  const totalOS = Number((await db.prepare("SELECT COUNT(*) as total FROM ordens_servico").get()).total);
  const osAtivas = Number((await db.prepare("SELECT COUNT(*) as total FROM ordens_servico WHERE status != 'concluida'").get()).total);
  const totalBercos = Number((await db.prepare("SELECT COUNT(*) as total FROM bercos").get()).total);
  const bercosOcupados = Number((await db.prepare("SELECT COUNT(*) as total FROM bercos WHERE status = 'ocupado'").get()).total);
  const totalEquipe = Number((await db.prepare("SELECT COUNT(*) as total FROM tripulacao").get()).total);
  const totalEstoque = Number((await db.prepare("SELECT COUNT(*) as total FROM estoque").get()).total);
  const estoqueBaixo = Number((await db.prepare("SELECT COUNT(*) as total FROM estoque WHERE quantidade < minimo").get()).total);
  const notificacoesNaoLidas = Number((await db.prepare("SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND lida = 0").get(req.usuario.id)).total);

  // Últimas OS
  const ultimasOS = await db.prepare("SELECT * FROM ordens_servico ORDER BY criado_em DESC LIMIT 5").all();

  res.json({
    os: { total: totalOS, ativas: osAtivas },
    bercos: { total: totalBercos, ocupados: bercosOcupados },
    equipe: { total: totalEquipe },
    estoque: { total: totalEstoque, baixo: estoqueBaixo },
    notificacoes: { naoLidas: notificacoesNaoLidas },
    ultimasOS
  });
});

module.exports = router;
