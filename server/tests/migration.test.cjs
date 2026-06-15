const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const projectRoot = path.resolve(__dirname, "..", "..");
const port = 33000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}/api`;
const dbPath = path.join(os.tmpdir(), `bordo-legacy-${process.pid}-${Date.now()}.db`);
let server;

function createLegacyDatabase() {
  const database = new Database(dbPath);
  database.exec(`
    CREATE TABLE usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL, perfil TEXT NOT NULL DEFAULT 'marinheiro', avatar TEXT DEFAULT '',
      cargo TEXT DEFAULT '', embarcacao TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE diario (
      id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL,
      descricao TEXT NOT NULL, autor TEXT NOT NULL, assinado INTEGER DEFAULT 0,
      data TEXT DEFAULT '', hora TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, categoria TEXT NOT NULL,
      item TEXT NOT NULL, feito INTEGER DEFAULT 0, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE tripulacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      habilitacao TEXT DEFAULT '', certificado TEXT DEFAULT '', status TEXT DEFAULT 'ok',
      avatar TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, unidade TEXT DEFAULT 'un',
      quantidade INTEGER DEFAULT 0, minimo INTEGER DEFAULT 0, categoria TEXT DEFAULT 'Geral',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE ordens_servico (
      id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT UNIQUE NOT NULL, embarcacao TEXT NOT NULL,
      cliente TEXT DEFAULT '', tipo TEXT DEFAULT 'Servico', prioridade TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'aguardando', descricao TEXT DEFAULT '', responsavel TEXT DEFAULT '',
      abertura TEXT DEFAULT '', previsao TEXT DEFAULT '', fotos INTEGER DEFAULT 0,
      observacao TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE os_tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT, os_id INTEGER NOT NULL, tarefa TEXT NOT NULL,
      done INTEGER DEFAULT 0
    );
    CREATE TABLE notificacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT DEFAULT 'info',
      lida INTEGER DEFAULT 0, icone TEXT DEFAULT '', titulo TEXT NOT NULL, corpo TEXT DEFAULT '',
      acao TEXT DEFAULT '', categoria TEXT DEFAULT 'geral',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE bercos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, numero TEXT UNIQUE NOT NULL,
      embarcacao TEXT DEFAULT '-', cliente TEXT DEFAULT '-', status TEXT DEFAULT 'livre',
      entrada TEXT DEFAULT '-', saida TEXT DEFAULT '-'
    );
  `);
  database.prepare(
    `INSERT INTO usuarios (nome,email,senha,perfil,avatar,cargo)
     VALUES (?,?,?,?,?,?)`,
  ).run("Gestor Legado", "legado@teste.local", bcrypt.hashSync("senha-legado", 10), "gestor", "GST", "Gestor");
  database.prepare(
    `INSERT INTO ordens_servico (codigo,embarcacao,tipo)
     VALUES (?,?,?)`,
  ).run("OS-LEGADA-001", "Barco Antigo", "Revisao");
  database.close();
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Servidor de migracao nao iniciou");
}

test.before(async () => {
  createLegacyDatabase();
  server = spawn(process.execPath, ["server/index.cjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      BORDO_DB_PATH: dbPath,
      DATABASE_URL: "",
      PG_URL: "",
      JWT_SECRET: "migration-test-secret",
    },
    stdio: "ignore",
  });
  await waitForServer();
});

test.after(async () => {
  if (server && !server.killed) {
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
  for (const suffix of ["", "-shm", "-wal"]) {
    try {
      fs.rmSync(`${dbPath}${suffix}`, { force: true });
    } catch {
      // Best-effort cleanup on Windows.
    }
  }
});

test("migra dados legados para a empresa padrao sem perdas", async () => {
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "legado@teste.local", senha: "senha-legado" }),
  });
  const login = await loginResponse.json();
  assert.equal(loginResponse.status, 200);
  assert.ok(login.user.empresa_id);
  assert.equal(login.user.papel, "proprietario");

  const ordersResponse = await fetch(`${baseUrl}/ordens`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  const orders = await ordersResponse.json();
  assert.equal(ordersResponse.status, 200);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].codigo, "OS-LEGADA-001");
  assert.equal(orders[0].empresa_id, login.user.empresa_id);
});
