const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const port = 34000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}/api`;
const dbPath = path.join(os.tmpdir(), `bordo-commercial-${process.pid}-${Date.now()}.db`);
let server;

async function request(pathname, options = {}, token) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json();
  return { status: response.status, body };
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
  throw new Error("Servidor de teste nao iniciou");
}

test.before(async () => {
  server = spawn(process.execPath, ["server/index.cjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      BORDO_DB_PATH: dbPath,
      DATABASE_URL: "",
      PG_URL: "",
      JWT_SECRET: "commercial-secret",
      PUBLIC_APP_URL: `http://127.0.0.1:${port}`,
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
    fs.rmSync(`${dbPath}${suffix}`, { force: true });
  }
});

test("fluxo comercial manual bloqueia inadimplencia sem apagar dados", async () => {
  const stamp = Date.now();
  const owner = await request("/auth/registro", {
    method: "POST",
    body: JSON.stringify({
      nome: "Dono Comercial",
      nome_empresa: "Marina Comercial",
      email: `comercial-${stamp}@teste.local`,
      senha: "senha-segura-1",
    }),
  });
  assert.equal(owner.status, 201);

  const checkout = await request("/assinaturas/checkout", {
    method: "POST",
    body: JSON.stringify({ plano: "profissional", provider: "manual" }),
  }, owner.body.token);
  assert.equal(checkout.status, 201);
  assert.equal(checkout.body.provider, "manual");
  assert.match(checkout.body.checkout_url, /checkout\/manual/);

  const subscriptions = await request("/assinaturas/admin", {}, owner.body.token);
  assert.equal(subscriptions.status, 200);
  const company = subscriptions.body.find((item) => item.id === owner.body.user.empresa_id);
  assert.ok(company);

  const blocked = await request(`/assinaturas/admin/${company.id}`, {
    method: "PUT",
    body: JSON.stringify({ billing_status: "past_due", ativo: 1 }),
  }, owner.body.token);
  assert.equal(blocked.status, 200);
  assert.equal(blocked.body.billing_status, "past_due");
  assert.equal(blocked.body.assinatura.ativo, false);

  const deniedOrder = await request("/ordens", {
    method: "POST",
    body: JSON.stringify({ embarcacao: "Lancha Bloqueada", tipo: "Limpeza" }),
  }, owner.body.token);
  assert.equal(deniedOrder.status, 402);

  const stillReadable = await request("/empresa", {}, owner.body.token);
  assert.equal(stillReadable.status, 200);
  assert.equal(stillReadable.body.nome, "Marina Comercial");
});
