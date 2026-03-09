import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type { UserRepository } from "../../application/ports/repositories/user.repository.js";
import type { UserRecord, UserProfile } from "../../domain/models/user.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: AppDatabase) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return result[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return result[0] ?? null;
  }

  async create(data: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<UserRecord> {
    const [user] = await this.db
      .insert(schema.users)
      .values({
        id: data.id,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role as "admin" | "editor" | "member",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return user;
  }

  async updateFailedAttempts(
    id: string,
    failedAttempts: number,
    lockedUntil: string | null,
  ): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ failedAttempts, lockedUntil })
      .where(eq(schema.users.id, id));
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ passwordHash, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, id));
  }

  async updateName(id: string, name: string): Promise<UserProfile | null> {
    const [updated] = await this.db
      .update(schema.users)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, id))
      .returning();
    if (!updated) return null;
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }

  async updateRole(id: string, role: string): Promise<UserProfile | null> {
    const [updated] = await this.db
      .update(schema.users)
      .set({ role: role as "admin" | "editor" | "member", updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, id))
      .returning();
    if (!updated) return null;
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
    return true;
  }

  async findAll(): Promise<UserProfile[]> {
    const allUsers = await this.db.select().from(schema.users);
    return allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
  }
}
