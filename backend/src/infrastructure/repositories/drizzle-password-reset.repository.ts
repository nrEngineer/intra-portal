import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type {
  PasswordResetRepository,
  PasswordResetEntry,
} from "../../application/ports/repositories/password-reset.repository.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzlePasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly db: AppDatabase) {}

  async create(data: Omit<PasswordResetEntry, "usedAt">): Promise<void> {
    await this.db.insert(schema.passwordResetTokens).values({
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
    });
  }

  async findByToken(token: string): Promise<PasswordResetEntry | null> {
    const result = await this.db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token));
    return result[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.id, id));
  }
}
