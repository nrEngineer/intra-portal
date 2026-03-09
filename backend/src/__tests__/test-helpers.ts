import { initDb, getDb } from "../db/connection.js";
import { createTables, clearAllTables } from "../db/create-tables.js";
import * as schema from "../db/schema.js";
import bcryptjs from "bcryptjs";
import type { AppDatabase } from "../db/connection.js";
import { container } from "../app.js";
import type { InMemoryEmailService } from "../infrastructure/services/in-memory-email.service.js";

let initialized = false;

export async function setupTestDb(): Promise<AppDatabase> {
  if (!initialized) {
    await initDb(":memory:");
    await createTables(getDb());
    initialized = true;
  }
  return getDb();
}

export async function resetTestDb(): Promise<void> {
  const db = getDb();
  await clearAllTables(db);
  (container.emailService as InMemoryEmailService).reset();
}

export async function seedTestAdmin(
  password: string = "Admin123",
): Promise<{ id: string; email: string; role: string }> {
  const db = getDb();
  const hash = await bcryptjs.hash(password, 10);
  const now = new Date().toISOString();
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@example.com",
      name: "管理者",
      passwordHash: hash,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return { id: admin.id, email: admin.email, role: admin.role };
}

export async function seedTestMember(
  password: string = "Member123",
): Promise<{ id: string; email: string; role: string }> {
  const db = getDb();
  const hash = await bcryptjs.hash(password, 10);
  const now = new Date().toISOString();
  const [member] = await db
    .insert(schema.users)
    .values({
      email: "member@example.com",
      name: "メンバー",
      passwordHash: hash,
      role: "member",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return { id: member.id, email: member.email, role: member.role };
}

export async function seedTestEditor(
  password: string = "Editor123",
): Promise<{ id: string; email: string; role: string }> {
  const db = getDb();
  const hash = await bcryptjs.hash(password, 10);
  const now = new Date().toISOString();
  const [editor] = await db
    .insert(schema.users)
    .values({
      email: "editor@example.com",
      name: "エディター",
      passwordHash: hash,
      role: "editor",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return { id: editor.id, email: editor.email, role: editor.role };
}
