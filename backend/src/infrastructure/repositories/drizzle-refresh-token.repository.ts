import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type {
  RefreshTokenRepository,
  RefreshTokenEntry,
} from "../../application/ports/repositories/refresh-token.repository.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: AppDatabase) {}

  async create(data: RefreshTokenEntry): Promise<void> {
    await this.db.insert(schema.refreshTokens).values({
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
    });
  }

  async findByToken(token: string): Promise<RefreshTokenEntry | null> {
    const result = await this.db
      .select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, token));
    return result[0] ?? null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, token));
  }
}
