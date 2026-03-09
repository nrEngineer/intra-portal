import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin } from "./test-helpers.js";
import { container } from "../app.js";
import type { InMemoryEmailService } from "../infrastructure/services/in-memory-email.service.js";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", ...options.headers },
  };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

beforeAll(async () => {
  await setupTestDb();
});

describe("UC-1: ログイン", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("正しい認証情報でログイン→アクセス+リフレッシュトークン返却", async () => {
    const res = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBeTruthy();
    expect(data.refreshToken).toBeTruthy();
    expect(data.user.email).toBe("admin@example.com");
  });

  it("存在しないメール→401", async () => {
    const res = await req("POST", "/api/auth/login", {
      body: { email: "none@example.com", password: "Admin123" },
    });
    expect(res.status).toBe(401);
  });

  it("間違ったパスワード→401", async () => {
    const res = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Wrong123" },
    });
    expect(res.status).toBe(401);
  });
});

describe("UC-2: トークンリフレッシュ", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("有効なリフレッシュトークンで新しいアクセストークン取得", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { refreshToken } = await loginRes.json();

    const res = await req("POST", "/api/auth/refresh", {
      body: { refreshToken },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBeTruthy();
  });

  it("無効なリフレッシュトークン→401", async () => {
    const res = await req("POST", "/api/auth/refresh", {
      body: { refreshToken: "invalid-token" },
    });
    expect(res.status).toBe(401);
  });
});

describe("UC-3: ログアウト", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("ログアウトでリフレッシュトークン無効化", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { refreshToken } = await loginRes.json();

    const logoutRes = await req("POST", "/api/auth/logout", {
      body: { refreshToken },
    });
    expect(logoutRes.status).toBe(200);
  });

  it("ログアウト後のリフレッシュ→401", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { refreshToken } = await loginRes.json();

    await req("POST", "/api/auth/logout", { body: { refreshToken } });

    const refreshRes = await req("POST", "/api/auth/refresh", {
      body: { refreshToken },
    });
    expect(refreshRes.status).toBe(401);
  });
});

describe("UC-4: ユーザー登録（管理者のみ）", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("管理者がユーザー作成→201", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { user } = await loginRes.json();
    const adminAuth = { "x-user-id": user.id, "x-user-role": "admin" };

    const res = await req("POST", "/api/users", {
      headers: adminAuth,
      body: { email: "new@example.com", name: "新規", password: "NewUser123", role: "member" },
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe("new@example.com");
  });

  it("一般社員がユーザー作成→403", async () => {
    const memberAuth = { "x-user-id": "member-1", "x-user-role": "member" };
    const res = await req("POST", "/api/users", {
      headers: memberAuth,
      body: { email: "new@example.com", name: "新規", password: "NewUser123", role: "member" },
    });
    expect(res.status).toBe(403);
  });
});

describe("UC-5: プロフィール取得・更新", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("自分のプロフィール取得", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { user } = await loginRes.json();
    const auth = { "x-user-id": user.id, "x-user-role": user.role };

    const res = await req("GET", "/api/users/me", { headers: auth });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe("admin@example.com");
  });

  it("自分の名前を変更", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { user } = await loginRes.json();
    const auth = { "x-user-id": user.id, "x-user-role": user.role };

    const res = await req("PUT", "/api/users/me", {
      headers: auth,
      body: { name: "田中太郎" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("田中太郎");
  });
});

describe("UC-6: ユーザー一覧（管理者のみ）", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("管理者がユーザー一覧取得", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { user } = await loginRes.json();
    const auth = { "x-user-id": user.id, "x-user-role": "admin" };

    const res = await req("GET", "/api/users", { headers: auth });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  it("一般社員がユーザー一覧→403", async () => {
    const res = await req("GET", "/api/users", {
      headers: { "x-user-id": "member-1", "x-user-role": "member" },
    });
    expect(res.status).toBe(403);
  });
});

describe("UC-7: ロール変更（管理者のみ）", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
    // Create a member user
    const hash = await bcryptjs.hash("Member123", 10);
    const now = new Date().toISOString();
    await getDb().insert(schema.users).values({
      email: "member@example.com",
      name: "メンバー",
      passwordHash: hash,
      role: "member",
      createdAt: now,
      updatedAt: now,
    });
  });

  it("管理者がロール変更", async () => {
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    const { user: admin } = await loginRes.json();
    const adminAuth = { "x-user-id": admin.id, "x-user-role": "admin" };

    const member = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "member@example.com"))
      .then((r) => r[0]);

    const res = await req("PUT", `/api/users/${member.id}/role`, {
      headers: adminAuth,
      body: { role: "admin" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.role).toBe("admin");
  });
});

describe("UC-8: パスワードリセット要求", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("リセットトークン発行", async () => {
    const res = await req("POST", "/api/auth/password-reset/request", {
      body: { email: "admin@example.com" },
    });
    expect(res.status).toBe(200);
    expect((container.emailService as InMemoryEmailService).getSentEmails().length).toBe(1);
  });

  it("存在しないメール→成功レスポンス（情報漏洩防止）", async () => {
    const res = await req("POST", "/api/auth/password-reset/request", {
      body: { email: "nonexistent@example.com" },
    });
    expect(res.status).toBe(200);
    expect((container.emailService as InMemoryEmailService).getSentEmails().length).toBe(0);
  });
});

describe("UC-9: パスワードリセット実行", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("有効なリセットトークンでパスワード変更", async () => {
    const user = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"))
      .then((r) => r[0]);

    const token = crypto.randomUUID();
    await getDb().insert(schema.passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    const res = await req("POST", "/api/auth/password-reset/execute", {
      body: { token, newPassword: "NewPass123" },
    });
    expect(res.status).toBe(200);

    // Can login with new password
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "NewPass123" },
    });
    expect(loginRes.status).toBe(200);
  });

  it("期限切れリセットトークン→400", async () => {
    const res = await req("POST", "/api/auth/password-reset/execute", {
      body: { token: "expired-token", newPassword: "NewPass123" },
    });
    expect(res.status).toBe(400);
  });
});
