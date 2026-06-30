const fs = require("fs");
const os = require("os");
const path = require("path");
const Database = require("better-sqlite3");

const backupDir = process.argv[2];
if (!backupDir) {
  console.error("Uso: node scripts/restore-test.cjs <diretorio-backup-sqlite>");
  process.exit(1);
}

const source = path.join(backupDir, "bordo.db");
if (!fs.existsSync(source)) {
  console.error(`Backup SQLite invalido: ${source}`);
  process.exit(1);
}

const restorePath = path.join(os.tmpdir(), `bordo-restore-test-${process.pid}-${Date.now()}.db`);
for (const suffix of ["", "-wal", "-shm"]) {
  const backupFile = `${source}${suffix}`;
  if (fs.existsSync(backupFile)) {
    fs.copyFileSync(backupFile, `${restorePath}${suffix}`);
  }
}

let db;
try {
  db = new Database(restorePath, { readonly: true });
  const tables = db.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table'").get();
  const empresas = db.prepare("SELECT COUNT(*) AS total FROM empresas").get();
  console.log(JSON.stringify({ ok: true, restore: restorePath, tables: tables.total, empresas: empresas.total }));
} finally {
  if (db) db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) {
      fs.rmSync(`${restorePath}${suffix}`, { force: true, maxRetries: 3, retryDelay: 200 });
    }
  } catch (error) {
    console.warn(JSON.stringify({ ok: false, cleanup: restorePath, warning: error.message }));
  }
}
