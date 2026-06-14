// ?? ROTA ADORMECIDA — Módulo de Horas Trabalhadas
// Para ativar:
// 1. Descomente em server/index.js: app.use("/api/horas", require("./routes/horas.js"));
// 2. Rode: node server/init-horas.js (se existir)
// 3. Reinicie o servidor

const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");

const router = express.Router();

// GET /api/horas
router.get("/", auth, (req, res) => {
  // Futuro: SELECT * FROM horas_trabalhadas WHERE usuario_id = ?
  res.json({ mensagem: "Módulo de horas adormecido. Ative em server/index.js", ativo: false });
});

module.exports = router;
