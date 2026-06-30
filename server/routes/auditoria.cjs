const express = require("express");
const db = require("../database.cjs");
const auth = require("../middleware.cjs");
const { requireAccess } = require("../middleware.cjs");

const router = express.Router();
const canView = requireAccess({
  roles: ["proprietario", "gestor"],
  profiles: ["gestor"],
});

router.get("/", auth, canView, async (req, res) => {
  const logs = await db.prepare(
    `SELECT *
     FROM auditoria
     WHERE empresa_id = ?
     ORDER BY criado_em DESC, id DESC
     LIMIT 120`,
  ).all(req.usuario.empresa_id);
  return res.json(logs);
});

module.exports = router;
