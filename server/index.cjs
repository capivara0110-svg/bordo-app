require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.cjs"));
app.use("/api/diario", require("./routes/diario.cjs"));
app.use("/api/checklist", require("./routes/checklist.cjs"));
app.use("/api/tripulacao", require("./routes/tripulacao.cjs"));
app.use("/api/estoque", require("./routes/estoque.cjs"));
app.use("/api/ordens", require("./routes/ordens.cjs"));
app.use("/api/notificacoes", require("./routes/notificacoes.cjs"));
app.use("/api/bercos", require("./routes/bercos.cjs"));
app.use("/api/dashboard", require("./routes/dashboard.cjs"));

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
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

async function start() {
  await db.ready;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BORDO. rodando na porta ${PORT} com ${db.engine}`);
  });
}

start().catch((error) => {
  console.error("Falha ao iniciar o BORDO.", error);
  process.exit(1);
});
