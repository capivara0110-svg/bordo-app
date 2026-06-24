const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const port = 32000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}/api`;
const dbPath = path.join(os.tmpdir(), `bordo-test-${process.pid}-${Date.now()}.db`);
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
      JWT_SECRET: "test-secret",
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
      // Windows can briefly retain a SQLite file handle after process exit.
    }
  }
});

test("isola dados entre empresas e aplica permissoes", async () => {
  const stamp = Date.now();
  const first = await request("/auth/registro", {
    method: "POST",
    body: JSON.stringify({
      nome: "Dono Um",
      nome_empresa: "Marina Um",
      email: `dono1-${stamp}@teste.local`,
      senha: "senha-segura-1",
    }),
  });
  const second = await request("/auth/registro", {
    method: "POST",
    body: JSON.stringify({
      nome: "Dono Dois",
      nome_empresa: "Marina Dois",
      email: `dono2-${stamp}@teste.local`,
      senha: "senha-segura-2",
    }),
  });

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.body.user.empresa_id, second.body.user.empresa_id);
  assert.ok(first.body.user.empresa_trial_termina_em);

  const firstCompany = await request("/empresa", {}, first.body.token);
  assert.equal(firstCompany.status, 200);
  assert.equal(firstCompany.body.assinatura.plano, "trial");
  assert.equal(firstCompany.body.assinatura.limites.usuarios, 3);

  const createdClient = await request("/clientes", {
    method: "POST",
    body: JSON.stringify({
      nome: "Cliente Marina",
      telefone: "11999999999",
      email: "cliente@teste.local",
    }),
  }, first.body.token);
  assert.equal(createdClient.status, 201);
  assert.equal(createdClient.body.nome, "Cliente Marina");

  const createdBoat = await request("/embarcacoes", {
    method: "POST",
    body: JSON.stringify({
      cliente_id: createdClient.body.id,
      nome: "Lancha Privada",
      tipo: "Lancha",
      tamanho: "32 pes",
    }),
  }, first.body.token);
  assert.equal(createdBoat.status, 201);
  assert.equal(createdBoat.body.cliente_nome, "Cliente Marina");

  const secondClients = await request("/clientes", {}, second.body.token);
  const secondBoats = await request("/embarcacoes", {}, second.body.token);
  assert.equal(secondClients.body.length, 0);
  assert.equal(secondBoats.body.length, 0);

  const createdOrder = await request("/ordens", {
    method: "POST",
    body: JSON.stringify({
      cliente_id: createdClient.body.id,
      embarcacao_id: createdBoat.body.id,
      tipo: "Revisao",
      tarefas: ["Avaliar motor", "Testar navegacao"],
    }),
  }, first.body.token);
  assert.equal(createdOrder.status, 201);
  assert.equal(createdOrder.body.itens.length, 2);
  assert.equal(createdOrder.body.cliente, "Cliente Marina");
  assert.equal(createdOrder.body.embarcacao, "Lancha Privada");
  assert.equal(createdOrder.body.cliente_id, createdClient.body.id);
  assert.equal(createdOrder.body.embarcacao_id, createdBoat.body.id);

  const clientHistory = await request(`/clientes/${createdClient.body.id}/historico`, {}, first.body.token);
  assert.equal(clientHistory.status, 200);
  assert.equal(clientHistory.body.cliente.nome, "Cliente Marina");
  assert.equal(clientHistory.body.embarcacoes.length, 1);
  assert.equal(clientHistory.body.ordens.length, 1);
  assert.equal(clientHistory.body.ordens[0].codigo, createdOrder.body.codigo);

  const boatHistory = await request(`/embarcacoes/${createdBoat.body.id}/historico`, {}, first.body.token);
  assert.equal(boatHistory.status, 200);
  assert.equal(boatHistory.body.embarcacao.nome, "Lancha Privada");
  assert.equal(boatHistory.body.ordens.length, 1);
  assert.equal(boatHistory.body.ordens[0].codigo, createdOrder.body.codigo);

  const deniedClientHistory = await request(`/clientes/${createdClient.body.id}/historico`, {}, second.body.token);
  const deniedBoatHistory = await request(`/embarcacoes/${createdBoat.body.id}/historico`, {}, second.body.token);
  assert.equal(deniedClientHistory.status, 404);
  assert.equal(deniedBoatHistory.status, 404);

  const editedOrder = await request(`/ordens/${createdOrder.body.id}`, {
    method: "PUT",
    body: JSON.stringify({
      cliente: "Cliente Teste",
      prioridade: "urgente",
      status: "em_andamento",
      responsavel: "Tecnico Um",
    }),
  }, first.body.token);
  assert.equal(editedOrder.status, 200);
  assert.equal(editedOrder.body.cliente, "Cliente Teste");
  assert.equal(editedOrder.body.prioridade, "urgente");
  assert.equal(editedOrder.body.status, "em_andamento");

  const taskAdded = await request(`/ordens/${createdOrder.body.id}/tarefas`, {
    method: "POST",
    body: JSON.stringify({ tarefa: "Registrar fotos" }),
  }, first.body.token);
  assert.equal(taskAdded.status, 201);
  assert.equal(taskAdded.body.itens.length, 3);

  const taskToggled = await request(`/ordens/${createdOrder.body.id}/tarefa/${taskAdded.body.itens[0].id}`, {
    method: "PUT",
  }, first.body.token);
  assert.equal(taskToggled.status, 200);
  assert.equal(Number(taskToggled.body.itens[0].done), 1);

  const firstOrders = await request("/ordens", {}, first.body.token);
  const secondOrders = await request("/ordens", {}, second.body.token);
  assert.equal(firstOrders.body.length, 1);
  assert.equal(secondOrders.body.length, 0);

  const crossTenantUpdate = await request(`/ordens/${createdOrder.body.id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "concluida" }),
  }, second.body.token);
  assert.equal(crossTenantUpdate.status, 404);

  const statusUpdated = await request(`/ordens/${createdOrder.body.id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "concluida" }),
  }, first.body.token);
  assert.equal(statusUpdated.status, 200);
  assert.equal(statusUpdated.body.status, "concluida");

  const memberEmail = `membro-${stamp}@teste.local`;
  const member = await request("/empresa/membros", {
    method: "POST",
    body: JSON.stringify({
      nome: "Membro Um",
      email: memberEmail,
      senha: "senha-membro-1",
      perfil: "marinheiro",
      papel: "membro",
    }),
  }, first.body.token);
  assert.equal(member.status, 201);

  const secondMember = await request("/empresa/membros", {
    method: "POST",
    body: JSON.stringify({
      nome: "Membro Dois",
      email: `membro2-${stamp}@teste.local`,
      senha: "senha-membro-2",
      perfil: "marinheiro",
      papel: "membro",
    }),
  }, first.body.token);
  assert.equal(secondMember.status, 201);

  const overUserLimit = await request("/empresa/membros", {
    method: "POST",
    body: JSON.stringify({
      nome: "Membro Tres",
      email: `membro3-${stamp}@teste.local`,
      senha: "senha-membro-3",
      perfil: "marinheiro",
      papel: "membro",
    }),
  }, first.body.token);
  assert.equal(overUserLimit.status, 403);
  assert.equal(overUserLimit.body.codigo, "LIMITE_PLANO");

  const memberLogin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: memberEmail, senha: "senha-membro-1" }),
  });
  assert.equal(memberLogin.status, 200);

  const deniedStockWrite = await request("/estoque", {
    method: "POST",
    body: JSON.stringify({ nome: "Item restrito", quantidade: 1 }),
  }, memberLogin.body.token);
  assert.equal(deniedStockWrite.status, 403);
});
