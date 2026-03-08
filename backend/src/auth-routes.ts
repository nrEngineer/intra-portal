import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import {
  generateAccessToken,
  validatePassword,
  hashPassword,
  comparePassword,
} from "./auth-utils.js";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { User, UserRole } from "./types.js";
import { randomUUID } from "crypto";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

type Env = { Variables: { user: User } };

const auth = new Hono<Env>();

// Mock email storage (for testing)
let sentEmails: Array<{ to: string; subject: string; token: string }> = [];

export function getSentEmails() {
  return sentEmails;
}

export function resetSentEmails() {
  sentEmails = [];
}

// UC-1: Login
auth.post("/login", async (c) => {
  const db = getDb();
  const { email, password } = await c.req.json<{ email: string; password: string }>();

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .then((r) => r[0]);

  // Check lock
  if (user && user.lockedUntil) {
    const lockedUntilMs = new Date(user.lockedUntil).getTime();
    if (lockedUntilMs > Date.now()) {
      return c.json({ error: "アカウントがロックされています。15分後に再試行してください" }, 423);
    }
    // Lock expired, reset
    await db
      .update(schema.users)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(schema.users.id, user.id));
  }

  if (!user) {
    await comparePassword(password, "$2b$10$dummy.hash.for.timing.attack.mitigation");
    return c.json({ error: "メールアドレスまたはパスワードが正しくありません" }, 401);
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
    return c.json({ error: "メールアドレスまたはパスワードが正しくありません" }, 401);
  }

  // Reset failed attempts
  await db
    .update(schema.users)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(schema.users.id, user.id));

  const accessToken = generateAccessToken(user.id, user.role);

  // Create refresh token
  const refreshToken = randomUUID();
  await db.insert(schema.refreshTokens).values({
    id: randomUUID(),
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
    createdAt: new Date().toISOString(),
  });

  return c.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// UC-2: Refresh token
auth.post("/refresh", async (c) => {
  const db = getDb();
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();

  const entry = await db
    .select()
    .from(schema.refreshTokens)
    .where(eq(schema.refreshTokens.token, refreshToken))
    .then((r) => r[0]);

  if (!entry || new Date(entry.expiresAt).getTime() < Date.now()) {
    return c.json({ error: "無効なリフレッシュトークンです" }, 401);
  }

  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, entry.userId))
    .then((r) => r[0]);

  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  return c.json({ accessToken });
});

// UC-3: Logout
auth.post("/logout", async (c) => {
  const db = getDb();
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));
  return c.json({ success: true });
});

// UC-8: Password reset request
auth.post("/password-reset/request", async (c) => {
  const db = getDb();
  const { email } = await c.req.json<{ email: string }>();

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
    sentEmails.push({ to: email, subject: "パスワードリセット", token });
  }

  return c.json({ message: "リセットメールを送信しました" });
});

// UC-9: Password reset execute
auth.post("/password-reset/execute", async (c) => {
  const db = getDb();
  const { token, newPassword } = await c.req.json<{ token: string; newPassword: string }>();

  const validationError = validatePassword(newPassword);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const entry = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.token, token))
    .then((r) => r[0]);

  if (!entry || new Date(entry.expiresAt).getTime() < Date.now() || entry.usedAt) {
    return c.json({ error: "無効または期限切れのトークンです" }, 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, entry.userId));

  await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.id, entry.id));

  return c.json({ success: true });
});

// Protected routes below
const users = new Hono<Env>();
users.use("/*", authMiddleware);

// UC-5: Get my profile
users.get("/me", async (c) => {
  const db = getDb();
  const reqUser = c.get("user");
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, reqUser.id))
    .then((r) => r[0]);
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

// UC-5: Update my profile
users.put("/me", async (c) => {
  const db = getDb();
  const reqUser = c.get("user");
  const { name } = await c.req.json<{ name: string }>();
  const [updated] = await db
    .update(schema.users)
    .set({ name, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, reqUser.id))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
});

// UC-6: List users (admin only)
users.get("/", adminOnly, async (c) => {
  const db = getDb();
  const allUsers = await db.select().from(schema.users);
  return c.json({
    data: allUsers.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
  });
});

// UC-4: Create user (admin only)
users.post("/", adminOnly, async (c) => {
  const db = getDb();
  const { email, name, password, role } = await c.req.json<{
    email: string;
    name: string;
    password: string;
    role: "admin" | "member";
  }>();

  const VALID_ROLES = ["admin", "editor", "member"];
  if (!VALID_ROLES.includes(role)) {
    return c.json({ error: "無効なロールです" }, 400);
  }

  const validationError = validatePassword(password);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .then((r) => r[0]);

  if (existing) {
    return c.json({ error: "このメールアドレスは既に使用されています" }, 409);
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const [user] = await db
    .insert(schema.users)
    .values({
      id: randomUUID(),
      email,
      name,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json({ id: user.id, email: user.email, name: user.name, role: user.role }, 201);
});

// UC-7: Delete user (admin only)
users.delete("/:id", adminOnly, async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  if (id === user.id) return c.json({ error: "Cannot delete yourself" }, 400);
  const db = getDb();
  const target = await db.select().from(schema.users).where(eq(schema.users.id, id)).then(r => r[0]);
  if (!target) return c.json({ error: "Not found" }, 404);
  await db.delete(schema.users).where(eq(schema.users.id, id));
  return c.body(null, 204);
});

// UC-7: Change user role (admin only)
users.put("/:id/role", adminOnly, async (c) => {
  const db = getDb();
  const id = c.req.param("id");
  const { role } = await c.req.json<{ role: "admin" | "member" }>();

  const VALID_ROLES = ["admin", "editor", "member"];
  if (!VALID_ROLES.includes(role)) {
    return c.json({ error: "無効なロールです" }, 400);
  }

  const [updated] = await db
    .update(schema.users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, id))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
});

export { auth, users };
