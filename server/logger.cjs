const crypto = require("crypto");

function log(level, event, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else console.log(line);
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);

  res.on("finish", () => {
    log(res.statusCode >= 500 ? "error" : "info", "http_request", {
      request_id: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - startedAt,
      empresa_id: req.usuario?.empresa_id || null,
      usuario_id: req.usuario?.id || null,
    });
  });

  next();
}

module.exports = { log, requestLogger };
