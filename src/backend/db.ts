import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbFile = process.env.KAFD_DB_FILE ?? path.resolve(process.cwd(), "data", "kafd.sqlite");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const sqlite = new Database(dbFile);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
