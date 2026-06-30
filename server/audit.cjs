const db = require("./database.cjs");

async function audit(usuario, entidade, entidadeId, acao, resumo, antes = null, depois = null) {
  if (!usuario?.empresa_id) return;
  await db.prepare(
    `INSERT INTO auditoria
     (empresa_id,usuario_id,usuario_nome,entidade,entidade_id,acao,resumo,antes,depois)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    usuario.empresa_id,
    usuario.id || null,
    usuario.nome || "",
    entidade,
    Number(entidadeId) || null,
    acao,
    resumo || "",
    antes ? JSON.stringify(antes).slice(0, 4000) : "",
    depois ? JSON.stringify(depois).slice(0, 4000) : "",
  );
}

module.exports = { audit };
