const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const backupsDir = process.env.BORDO_BACKUP_DIR || path.join(root, "backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
fs.mkdirSync(backupsDir, { recursive: true });

function backupSqlite() {
  const dbPath = process.env.BORDO_DB_PATH || path.join(root, "bordo.db");
  if (!fs.existsSync(dbPath)) throw new Error(`Banco SQLite nao encontrado: ${dbPath}`);

  const target = path.join(backupsDir, `bordo-sqlite-${stamp}`);
  fs.mkdirSync(target, { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const source = `${dbPath}${suffix}`;
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(target, `bordo.db${suffix}`));
    }
  }
  console.log(JSON.stringify({ ok: true, engine: "sqlite", backup: target }));
}

function backupPostgres() {
  const databaseUrl = process.env.DATABASE_URL || process.env.PG_URL;
  const target = path.join(backupsDir, `bordo-postgres-${stamp}.sql`);
  const result = spawnSync("pg_dump", [databaseUrl, "--file", target, "--no-owner"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) throw new Error("pg_dump falhou. Instale PostgreSQL client tools no ambiente.");
  console.log(JSON.stringify({ ok: true, engine: "postgresql", backup: target }));
}

if (process.env.DATABASE_URL || process.env.PG_URL) backupPostgres();
else backupSqlite();
