const bcrypt = require("bcryptjs");
const pgUrl = process.env.DATABASE_URL || process.env.PG_URL;

let db;

if (pgUrl) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });

  async function initPG() {
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL, perfil TEXT DEFAULT 'marinheiro', avatar TEXT DEFAULT '🧑‍✈️', cargo TEXT DEFAULT '', embarcacao TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS diario (id SERIAL PRIMARY KEY, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL, descricao TEXT NOT NULL, autor TEXT NOT NULL, assinado INTEGER DEFAULT 0, data TEXT DEFAULT TO_CHAR(NOW(),'DD/MM/YYYY'), hora TEXT DEFAULT TO_CHAR(NOW(),'HH24:MI'), criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS checklist (id SERIAL PRIMARY KEY, usuario_id INTEGER NOT NULL, categoria TEXT NOT NULL, item TEXT NOT NULL, feito INTEGER DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tripulacao (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL, habilitacao TEXT DEFAULT '', certificado TEXT DEFAULT '', status TEXT DEFAULT 'ok', avatar TEXT DEFAULT '👤', criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS estoque (id SERIAL PRIMARY KEY, nome TEXT NOT NULL, unidade TEXT DEFAULT 'un', quantidade INTEGER DEFAULT 0, minimo INTEGER DEFAULT 0, categoria TEXT DEFAULT 'Geral', criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ordens_servico (id SERIAL PRIMARY KEY, codigo TEXT UNIQUE NOT NULL, embarcacao TEXT NOT NULL, cliente TEXT DEFAULT '', tipo TEXT DEFAULT 'Serviço', prioridade TEXT DEFAULT 'normal', status TEXT DEFAULT 'aguardando', descricao TEXT DEFAULT '', responsavel TEXT DEFAULT '', abertura TEXT DEFAULT TO_CHAR(NOW(),'DD/MM/YYYY'), previsao TEXT DEFAULT '', fotos INTEGER DEFAULT 0, observacao TEXT DEFAULT '', criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS os_tarefas (id SERIAL PRIMARY KEY, os_id INTEGER NOT NULL, tarefa TEXT NOT NULL, done INTEGER DEFAULT 0)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS notificacoes (id SERIAL PRIMARY KEY, usuario_id INTEGER NOT NULL, tipo TEXT DEFAULT 'info', lida INTEGER DEFAULT 0, icone TEXT DEFAULT '📌', titulo TEXT NOT NULL, corpo TEXT DEFAULT '', acao TEXT DEFAULT '', categoria TEXT DEFAULT 'geral', criado_em TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS bercos (id SERIAL PRIMARY KEY, numero TEXT UNIQUE NOT NULL, embarcacao TEXT DEFAULT '—', cliente TEXT DEFAULT '—', status TEXT DEFAULT 'livre', entrada TEXT DEFAULT '—', saida TEXT DEFAULT '—')`);

    const { rows } = await pool.query("SELECT COUNT(*) as total FROM usuarios");
    if (parseInt(rows[0].total) === 0) {
      const hash = bcrypt.hashSync("123456", 10);
      await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,avatar,cargo,embarcacao) VALUES ($1,$2,$3,$4,$5,$6,$7)", ["Carlos Mendes","carlos@bordo.app",hash,"marinheiro","🧑‍✈️","Capitão","MV Esperança"]);
      await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,avatar,cargo,embarcacao) VALUES ($1,$2,$3,$4,$5,$6,$7)", ["Rafael Silva","rafael@bordo.app",hash,"marinharia","🧹","Técnico de Marinharia","Marina São Paulo"]);
      await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,avatar,cargo,embarcacao) VALUES ($1,$2,$3,$4,$5,$6,$7)", ["Ana Costa","ana@bordo.app",hash,"tecnico","🔧","Mecânica Naval","Estaleiro Litoral"]);
      await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,avatar,cargo,embarcacao) VALUES ($1,$2,$3,$4,$5,$6,$7)", ["Admin Marina","admin@bordo.app",hash,"gestor","👔","Gestor","Marina São Paulo"]);
      console.log("🌱 Banco populado!");
    }
    console.log("✅ PostgreSQL (Railway) pronto!");

    return {
      run: (sql, ...params) => pool.query(sql, params),
      get: async (sql, ...params) => { const r = await pool.query(sql, params); return r.rows[0] || null; },
      all: async (sql, ...params) => { const r = await pool.query(sql, params); return r.rows; },
      prepare: (sql) => ({
        run: (...p) => pool.query(sql, p),
        get: async (...p) => { const r = await pool.query(sql, p); return r.rows[0] || null; },
        all: async (...p) => { const r = await pool.query(sql, p); return r.rows; },
      }),
    };
  }

  module.exports = initPG;
} else {
  const Database = require("better-sqlite3");
  const path = require("path");
  const dbPath = path.join(__dirname, "bordo.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
// ─── TABELAS ──────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL DEFAULT 'marinheiro',
    avatar TEXT DEFAULT '🧑‍✈️',
    cargo TEXT DEFAULT '',
    embarcacao TEXT DEFAULT '',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS diario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    autor TEXT NOT NULL,
    assinado INTEGER DEFAULT 0,
    data TEXT DEFAULT (date('now','localtime')),
    hora TEXT DEFAULT (time('now','localtime')),
    criado_em TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS checklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    item TEXT NOT NULL,
    feito INTEGER DEFAULT 0,
    criado_em TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS tripulacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    habilitacao TEXT DEFAULT '',
    certificado TEXT DEFAULT '',
    status TEXT DEFAULT 'ok',
    avatar TEXT DEFAULT '👤',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    unidade TEXT DEFAULT 'un',
    quantidade INTEGER DEFAULT 0,
    minimo INTEGER DEFAULT 0,
    categoria TEXT DEFAULT 'Geral',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    embarcacao TEXT NOT NULL,
    cliente TEXT DEFAULT '',
    tipo TEXT DEFAULT 'Serviço',
    prioridade TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'aguardando',
    descricao TEXT DEFAULT '',
    responsavel TEXT DEFAULT '',
    abertura TEXT DEFAULT (date('now','localtime')),
    previsao TEXT DEFAULT '',
    fotos INTEGER DEFAULT 0,
    observacao TEXT DEFAULT '',
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS os_tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    os_id INTEGER NOT NULL,
    tarefa TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    FOREIGN KEY (os_id) REFERENCES ordens_servico(id)
  );

  CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT DEFAULT 'info',
    lida INTEGER DEFAULT 0,
    icone TEXT DEFAULT '📌',
    titulo TEXT NOT NULL,
    corpo TEXT DEFAULT '',
    acao TEXT DEFAULT '',
    categoria TEXT DEFAULT 'geral',
    criado_em TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS bercos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE NOT NULL,
    embarcacao TEXT DEFAULT '—',
    cliente TEXT DEFAULT '—',
    status TEXT DEFAULT 'livre',
    entrada TEXT DEFAULT '—',
    saida TEXT DEFAULT '—'
  );
`);

// ─── SEED DATA ──────────────────────────────────────────

// Só popula se estiver vazio
const count = db.prepare("SELECT COUNT(*) as total FROM usuarios").get();
if (count.total === 0) {
  const hash = bcrypt.hashSync("123456", 10);

  const insUser = db.prepare("INSERT INTO usuarios (nome, email, senha, perfil, avatar, cargo, embarcacao) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insUser.run("Carlos Mendes", "carlos@bordo.app", hash, "marinheiro", "🧑‍✈️", "Capitão", "MV Esperança");
  insUser.run("Rafael Silva", "rafael@bordo.app", hash, "marinharia", "🧹", "Técnico de Marinharia", "Marina São Paulo");
  insUser.run("Ana Costa", "ana@bordo.app", hash, "tecnico", "🔧", "Mecânica Naval", "Estaleiro Litoral");
  insUser.run("Admin Marina", "admin@bordo.app", hash, "gestor", "👔", "Gestor", "Marina São Paulo");

  // Tripulação
  const insTrip = db.prepare("INSERT INTO tripulacao (nome, cargo, habilitacao, certificado, status, avatar) VALUES (?, ?, ?, ?, ?, ?)");
  insTrip.run("Rafael Silva", "Marinheiro de Máquinas", "2025-08-10", "2026-01-15", "ok", "🔧");
  insTrip.run("Carlos Mendes", "Capitão", "2024-12-01", "2025-11-20", "vencido", "🧑‍✈️");
  insTrip.run("João Ferreira", "Contramestre", "2026-03-20", "2026-06-01", "ok", "⚓");
  insTrip.run("Ana Costa", "Cozinheira de Bordo", "2025-07-05", "2026-02-10", "alerta", "👩‍🍳");

  // Diário
  const insDiario = db.prepare("INSERT INTO diario (usuario_id, tipo, descricao, autor, assinado, data, hora) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insDiario.run(1, "Saída", "Zarpe do Porto de Santos. Condições do mar: bom. 4 tripulantes.", "Carlos Mendes", 1, "12/06/2026", "08:00");
  insDiario.run(1, "Ocorrência", "Falha no gerador secundário. Acionado técnico de bordo.", "Rafael Silva", 1, "12/06/2026", "14:30");
  insDiario.run(1, "Manutenção", "Troca de óleo motor principal. 20L óleo 15W-40.", "Rafael Silva", 0, "13/06/2026", "07:15");

  // Check-list
  const insCL = db.prepare("INSERT INTO checklist (usuario_id, categoria, item, feito) VALUES (?, ?, ?, ?)");
  insCL.run(1, "Segurança", "Coletes salva-vidas verificados", 1);
  insCL.run(1, "Segurança", "Sinalizadores dentro da validade", 1);
  insCL.run(1, "Segurança", "Extintor de incêndio verificado", 0);
  insCL.run(1, "Motor", "Nível de óleo verificado", 1);
  insCL.run(1, "Motor", "Sistema de refrigeração OK", 1);
  insCL.run(1, "Motor", "Correia do alternador inspecionada", 0);
  insCL.run(1, "Navegação", "Cartas náuticas atualizadas", 1);
  insCL.run(1, "Navegação", "GPS e rádio VHF testados", 1);
  insCL.run(1, "Comunicação", "Rádio de emergência (EPirb) ativo", 0);

  // Estoque
  const insEst = db.prepare("INSERT INTO estoque (nome, unidade, quantidade, minimo, categoria) VALUES (?, ?, ?, ?, ?)");
  insEst.run("Óleo Motor 15W-40", "L", 12, 20, "Motor");
  insEst.run("Filtro de combustível", "un", 3, 2, "Motor");
  insEst.run("Combustível diesel", "L", 850, 300, "Combustível");
  insEst.run("Extintores reserva", "un", 1, 2, "Segurança");
  insEst.run("Kit primeiros socorros", "un", 2, 1, "Segurança");
  insEst.run("Água potável", "L", 200, 100, "Suprimentos");
  insEst.run("Alimentos (rações)", "dias", 5, 3, "Suprimentos");

  // OS
  const insOS = db.prepare("INSERT INTO ordens_servico (codigo, embarcacao, cliente, tipo, prioridade, status, descricao, responsavel, abertura, previsao, fotos, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insTarefa = db.prepare("INSERT INTO os_tarefas (os_id, tarefa, done) VALUES (?, ?, ?)");

  insOS.run("OS-2026-041", "Lancha Brisa Mar", "Pedro Albuquerque", "Limpeza", "normal", "em_andamento", "Limpeza completa do casco, convés e cabine interna.", "Rafael Silva", "13/06/2026", "13/06/2026", 2, "");
  insTarefa.run(1, "Lavar casco com produto anti-incrustante", 1);
  insTarefa.run(1, "Limpar e polir convés", 1);
  insTarefa.run(1, "Aspirar e limpar cabine interna", 0);

  insOS.run("OS-2026-039", "MV Esperança", "Marina São Paulo", "Manutenção", "urgente", "aguardando", "Revisão do motor principal e troca de filtros.", "Carlos Mendes", "12/06/2026", "14/06/2026", 0, "");
  insTarefa.run(2, "Trocar filtro de óleo", 0);
  insTarefa.run(2, "Trocar filtro de combustível", 0);
  insTarefa.run(2, "Verificar correias e mangueiras", 0);

  insOS.run("OS-2026-037", "Veleiro Nautilus", "Ana Rodrigues", "Pintura", "normal", "concluida", "Pintura antifouling do casco.", "Rafael Silva", "10/06/2026", "12/06/2026", 6, "Serviço concluído com aprovação do cliente.");
  insTarefa.run(3, "Lixar superfície do casco", 1);
  insTarefa.run(3, "Aplicar primeira demão antifouling", 1);
  insTarefa.run(3, "Aplicar segunda demão antifouling", 1);
  insTarefa.run(3, "Inspeção final e fotos", 1);

  // Notificações
  const insNot = db.prepare("INSERT INTO notificacoes (usuario_id, tipo, icone, titulo, corpo, acao, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insNot.run(1, "urgente", "🔴", "OS Urgente — MV Esperança", "A OS-2026-039 foi marcada como urgente. Revisão do motor antes de zarpar amanhã.", "Ver OS", "os");
  insNot.run(1, "alerta", "⚠️", "Habilitação vencendo em 12 dias", "A habilitação náutica de João Ferreira vence em 25/06/2026. Renove antes de escalar.", "Ver tripulante", "tripulacao");
  insNot.run(1, "alerta", "📦", "Estoque abaixo do mínimo", "Óleo Motor 15W-40 está com apenas 12L. Mínimo recomendado: 20L.", "Ver estoque", "estoque");

  // Berços
  const insBer = db.prepare("INSERT INTO bercos (numero, embarcacao, cliente, status, entrada, saida) VALUES (?, ?, ?, ?, ?, ?)");
  insBer.run("01", "MV Esperança", "Marina SP", "ocupado", "10/06", "16/06");
  insBer.run("02", "Lancha Brisa Mar", "Pedro Albuquerque", "ocupado", "12/06", "14/06");
  insBer.run("03", "—", "—", "livre", "—", "—");
  insBer.run("04", "Veleiro Nautilus", "Ana Rodrigues", "ocupado", "11/06", "20/06");
  insBer.run("05", "—", "—", "livre", "—", "—");
  insBer.run("06", "Escuna Mar Aberto", "Clube Náutico", "reservado", "15/06", "22/06");
  insBer.run("07", "Lancha Aurora", "Roberto Dias", "ocupado", "13/06", "15/06");
  insBer.run("08", "—", "—", "manutencao", "—", "—");

  console.log("🌱 Banco populado com dados iniciais!");
}

console.log("✅ Banco de dados pronto!");
  module.exports = function() { return db; };
}