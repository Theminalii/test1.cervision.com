import fs from "node:fs";
import path from "node:path";
import { sqlite } from "./db";

const migrationsDir = path.resolve(process.cwd(), "src", "backend", "migrations");

export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    sqlite
      .prepare("SELECT id FROM __migrations")
      .all()
      .map((row) => (row as { id: string }).id),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    sqlite.transaction(() => {
      sqlite.exec(sql);
      sqlite
        .prepare("INSERT INTO __migrations (id, applied_at) VALUES (?, ?)")
        .run(file, new Date().toISOString());
    })();
  }
}
