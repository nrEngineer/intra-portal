import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type AppDatabase = LibSQLDatabase<typeof schema>;

let client: Client | null = null;
let _db: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (!_db) {
    const dbPath = process.env.DB_PATH || "./data/portal.db";
    client = createClient({ url: `file:${dbPath}` });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export async function initDb(url?: string): Promise<AppDatabase> {
  if (client) {
    client.close();
    client = null;
    _db = null;
  }
  const dbUrl = url || `file:${process.env.DB_PATH || "./data/portal.db"}`;
  client = createClient({ url: dbUrl });
  _db = drizzle(client, { schema });
  return _db;
}

export function closeDb(): void {
  if (client) {
    client.close();
    client = null;
    _db = null;
  }
}
