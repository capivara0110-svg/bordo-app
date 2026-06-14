require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializa o banco (cria tabelas e popula se vazio)
require("./database.cjs");

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROTAS ATIVAS ----------------------------------------
app.use("/api/auth", require("./routes/auth.cjs"));
app.use("/api/diario", require("./routes/diario.cjs"));
app.use("/api/checklist", require("./routes/checklist.cjs"));
app.use("/api/tripulacao", require("./routes/tripulacao.cjs"));
app.use("/api/estoque", require("./routes/estoque.cjs"));
app.use("/api/ordens", require("./routes/ordens.cjs"));
app.use("/api/notificacoes", require("./routes/notificacoes.cjs"));
app.use("/api/bercos", require("./routes/bercos.cjs"));
app.use("/api/dashboard", require("./routes/dashboard.cjs"));

// --- ROTA ADORMECIDA (horas de trabalho) ----------------
// app.use("/api/horas", require("./routes/horas.cjs"));
// Para ativar: remova as // da linha acima e crie server/routes/horas.js

// --- HEALTH CHECK ----------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "online", app: "BORDO. API", versao: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`
? BORDO. API rodando!
?? http://localhost:${PORT}
?? http://localhost:${PORT}/api/health
  `);
});
