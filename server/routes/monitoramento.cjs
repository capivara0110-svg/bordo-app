const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canView = requireAccess({
  roles: ["proprietario", "gestor"],
  profiles: ["gestor"],
});

router.get("/erros", auth, canView, async (req, res) => {
  const logs = await db.prepare(
    `SELECT id, request_id, method, path, status, mensagem, criado_em
     FROM error_logs
     WHERE empresa_id IS NULL OR empresa_id = ?
     ORDER BY criado_em DESC, id DESC
     LIMIT 100`,
  ).all(req.usuario.empresa_id);
  return res.json(logs);
});

module.exports = router;
