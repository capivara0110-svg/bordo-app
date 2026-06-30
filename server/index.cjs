require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database.cjs");
const { log, requestLogger } = require("./logger.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/api/auth", require("./routes/auth.cjs"));
app.use("/api/empresa", require("./routes/empresa.cjs"));
app.use("/api/diario", require("./routes/diario.cjs"));
app.use("/api/checklist", require("./routes/checklist.cjs"));
app.use("/api/tripulacao", require("./routes/tripulacao.cjs"));
app.use("/api/estoque", require("./routes/estoque.cjs"));
app.use("/api/clientes", require("./routes/clientes.cjs"));
app.use("/api/embarcacoes", require("./routes/embarcacoes.cjs"));
app.use("/api/ordens", require("./routes/ordens.cjs"));
app.use("/api/agenda", require("./routes/agenda.cjs"));
app.use("/api/notificacoes", require("./routes/notificacoes.cjs"));
app.use("/api/bercos", require("./routes/bercos.cjs"));
app.use("/api/dashboard", require("./routes/dashboard.cjs"));
app.use("/api/auditoria", require("./routes/auditoria.cjs"));
app.use("/api/assinaturas", require("./routes/assinaturas.cjs"));
app.use("/api/monitoramento", require("./routes/monitoramento.cjs"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    app: "BORDO. API",
    versao: "1.0.0",
    database: db.engine,
  });
});

const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((err, req, res, next) => {
  log("error", "unhandled_error", {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status: err.statusCode || err.status || 500,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
  db.ready.then(() => db.prepare(
    `INSERT INTO error_logs
     (empresa_id,usuario_id,request_id,method,path,status,mensagem,stack)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    req.usuario?.empresa_id || null,
    req.usuario?.id || null,
    req.requestId || "",
    req.method || "",
    req.originalUrl || "",
    err.statusCode || err.status || 500,
    err.message || "Erro interno",
    process.env.NODE_ENV === "production" ? "" : String(err.stack || "").slice(0, 4000),
  )).catch(() => {});
  if (res.headersSent) return next(err);
  res.status(err.statusCode || err.status || 500).json({ erro: err.message || "Erro interno do servidor", request_id: req.requestId });
});

async function start() {
  await db.ready;
  app.listen(PORT, "0.0.0.0", () => {
    log("info", "server_started", { port: PORT, database: db.engine });
  });
}

start().catch((error) => {
  console.error("Falha ao iniciar o BORDO.", error);
  process.exit(1);
});
