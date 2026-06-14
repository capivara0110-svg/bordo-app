const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "bordo-secret-key-2026";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token nao fornecido" });
  }

  try {
    const token = header.split(" ")[1];
    req.usuario = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}

module.exports = authMiddleware;
