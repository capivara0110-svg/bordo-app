const jwt = require("jsonwebtoken");
const db = require("./database.cjs");

const JWT_SECRET = process.env.JWT_SECRET || "bordo-secret-key-2026";

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token nao fornecido" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare(
      `SELECT u.id, u.empresa_id, u.nome, u.email, u.perfil, u.papel,
              u.avatar, u.cargo, u.embarcacao
       FROM usuarios u
       JOIN empresas e ON e.id = u.empresa_id
       WHERE u.id = ? AND e.ativo = 1`,
    ).get(decoded.id);

    if (!user || !user.empresa_id) {
      return res.status(401).json({ erro: "Usuario ou empresa invalidos" });
    }

    req.usuario = user;
    return next();
  } catch {
    return res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: "Voce nao tem permissao para esta acao" });
    }
    return next();
  };
}

function requireAccess({ roles = [], profiles = [] }) {
  return (req, res, next) => {
    if (roles.includes(req.usuario.papel) || profiles.includes(req.usuario.perfil)) {
      return next();
    }
    return res.status(403).json({ erro: "Voce nao tem permissao para esta acao" });
  };
}

module.exports = authMiddleware;
module.exports.requireRoles = requireRoles;
module.exports.requireAccess = requireAccess;
