const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/dashboard - dados consolidados para o gestor
router.get("/", auth, (req, res) => {
  const totalOS = db.prepare("SELECT COUNT(*) as total FROM ordens_servico").get().total;
  const osAtivas = db.prepare("SELECT COUNT(*) as total FROM ordens_servico WHERE status != 'concluida'").get().total;
  const totalBercos = db.prepare("SELECT COUNT(*) as total FROM bercos").get().total;
  const bercosOcupados = db.prepare("SELECT COUNT(*) as total FROM bercos WHERE status = 'ocupado'").get().total;
  const totalEquipe = db.prepare("SELECT COUNT(*) as total FROM tripulacao").get().total;
  const totalEstoque = db.prepare("SELECT COUNT(*) as total FROM estoque").get().total;
  const estoqueBaixo = db.prepare("SELECT COUNT(*) as total FROM estoque WHERE quantidade < minimo").get().total;
  const notificacoesNaoLidas = db.prepare("SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND lida = 0").get(req.usuario.id).total;

  // Últimas OS
  const ultimasOS = db.prepare("SELECT * FROM ordens_servico ORDER BY criado_em DESC LIMIT 5").all();

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
