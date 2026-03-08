import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type AppDatabase = LibSQLDatabase<typeof schema>;

let client: Client | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

/** Get the current database instance */
export function getDb(): AppDatabase {
  if (!_db) {
    // Auto-init for Node.js (not Workers)
    const dbPath = process.env.DB_PATH || "./data/portal.db";
    client = createClient({ url: `file:${dbPath}` });
    _db = drizzle(client, { schema });
  }
  return _db;
}

/** Set the database instance (used by Workers for D1 injection) */
export function setDb(db: unknown): void {
  _db = db;
}

/** Initialize a new libsql database (Node.js only) */
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
