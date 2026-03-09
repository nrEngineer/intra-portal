import { eq } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import {
  generateAccessToken,
  validatePassword,
  hashPassword,
  comparePassword,
} from "../auth-utils.js";
import { VALID_ROLES } from "../types.js";
import type { UserRole } from "../types.js";
import { randomUUID } from "crypto";
import { emailService } from "./email.service.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export class AuthService {
  static async login(email: string, password: string) {
    const db = getDb();

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .then((r) => r[0]);

    // Check lock
    if (user && user.lockedUntil) {
      const lockedUntilMs = new Date(user.lockedUntil).getTime();
      if (lockedUntilMs > Date.now()) {
        return { error: "アカウントがロックされています。15分後に再試行してください", status: 423 as const };
      }
      await db
        .update(schema.users)
        .set({ failedAttempts: 0, lockedUntil: null })
        .where(eq(schema.users.id, user.id));
    }

    if (!user) {
      await comparePassword(password, "$2b$10$dummy.hash.for.timing.attack.mitigation");
      return { error: "メールアドレスまたはパスワードが正しくありません", status: 401 as const };
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      const newCount = user.failedAttempts + 1;
      const lockedUntil =
        newCount >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
      await db
        .update(schema.users)
        .set({ failedAttempts: newCount, lockedUntil })
        .where(eq(schema.users.id, user.id));
      return { error: "メールアドレスまたはパスワードが正しくありません", status: 401 as const };
    }

    // Reset failed attempts
    await db
      .update(schema.users)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(schema.users.id, user.id));

    const accessToken = generateAccessToken(user.id, user.role as UserRole);

    const refreshToken = randomUUID();
    await db.insert(schema.refreshTokens).values({
      id: randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return {
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    };
  }

  static async refresh(refreshToken: string) {
    const db = getDb();

    const entry = await db
      .select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, refreshToken))
      .then((r) => r[0]);

    if (!entry || new Date(entry.expiresAt).getTime() < Date.now()) {
      return { error: "無効なリフレッシュトークンです", status: 401 as const };
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, entry.userId))
      .then((r) => r[0]);

    if (!user) {
      return { error: "ユーザーが見つかりません", status: 401 as const };
    }

    const accessToken = generateAccessToken(user.id, user.role as UserRole);
    return { data: { accessToken } };
  }

  static async logout(refreshToken: string) {
    const db = getDb();
    await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));
  }

  static async requestPasswordReset(email: string) {
    const db = getDb();

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .then((r) => r[0]);

    if (user) {
      const token = randomUUID();
      await db.insert(schema.passwordResetTokens).values({
        id: randomUUID(),
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString(),
        createdAt: new Date().toISOString(),
      });
      emailService.send(email, "パスワードリセット", token);
    }
  }

  static async executePasswordReset(token: string, newPassword: string) {
    const db = getDb();

    const validationError = validatePassword(newPassword);
    if (validationError) {
      return { error: validationError, status: 400 as const };
    }

    const entry = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token))
      .then((r) => r[0]);

    if (!entry || new Date(entry.expiresAt).getTime() < Date.now() || entry.usedAt) {
      return { error: "無効または期限切れのトークンです", status: 400 as const };
    }

    const passwordHash = await hashPassword(newPassword);
    await db
      .update(schema.users)
      .set({ passwordHash, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, entry.userId));

    await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.id, entry.id));

    return { success: true };
  }

  static async getProfile(userId: string) {
    const db = getDb();
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .then((r) => r[0]);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  static async updateProfile(userId: string, name: string) {
    const db = getDb();
    const [updated] = await db
      .update(schema.users)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, userId))
      .returning();
    if (!updated) return null;
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }

  static async listUsers() {
    const db = getDb();
    const allUsers = await db.select().from(schema.users);
    return allUsers.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role }));
  }

  static async createUser(data: { email: string; name: string; password: string; role: string }) {
    const db = getDb();

    if (!VALID_ROLES.includes(data.role as UserRole)) {
      return { error: "無効なロールです", status: 400 as const };
    }

    const validationError = validatePassword(data.password);
    if (validationError) {
      return { error: validationError, status: 400 as const };
    }

    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email))
      .then((r) => r[0]);

    if (existing) {
      return { error: "このメールアドレスは既に使用されています", status: 409 as const };
    }

    const passwordHash = await hashPassword(data.password);
    const now = new Date().toISOString();
    const [user] = await db
      .insert(schema.users)
      .values({
        id: randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return { data: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  static async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) {
      return { error: "Cannot delete yourself", status: 400 as const };
    }
    const db = getDb();
    const target = await db.select().from(schema.users).where(eq(schema.users.id, id)).then((r) => r[0]);
    if (!target) return { error: "Not found", status: 404 as const };
    await db.delete(schema.users).where(eq(schema.users.id, id));
    return { success: true };
  }

  static async changeRole(id: string, role: string) {
    const db = getDb();

    if (!VALID_ROLES.includes(role as UserRole)) {
      return { error: "無効なロールです", status: 400 as const };
    }

    const [updated] = await db
      .update(schema.users)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updated) return { error: "Not found", status: 404 as const };
    return { data: { id: updated.id, email: updated.email, name: updated.name, role: updated.role } };
  }
}
