import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin } from "./test-helpers.js";
import { container } from "../app.js";
import type { InMemoryEmailService } from "../infrastructure/services/in-memory-email.service.js";

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

describe("認証機能 受け入れテスト", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("管理者ログイン → ユーザー作成 → 新ユーザーログイン → プロフィール取得", async () => {
    // 1. Admin login
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.accessToken).toBeDefined();
    expect(loginData.refreshToken).toBeDefined();

    const adminAuth = { "x-user-id": loginData.user.id, "x-user-role": "admin" };

    // 2. Admin creates a new user
    const createRes = await req("POST", "/api/users", {
      headers: adminAuth,
      body: { email: "tanaka@example.com", name: "田中太郎", password: "Tanaka123", role: "member" },
    });
    expect(createRes.status).toBe(201);

    // 3. New user logs in
    const newLoginRes = await req("POST", "/api/auth/login", {
      body: { email: "tanaka@example.com", password: "Tanaka123" },
    });
    expect(newLoginRes.status).toBe(200);
    const newLoginData = await newLoginRes.json();

    const memberAuth = { "x-user-id": newLoginData.user.id, "x-user-role": "member" };

    // 4. New user gets profile
    const profileRes = await req("GET", "/api/users/me", { headers: memberAuth });
    expect(profileRes.status).toBe(200);
    const profile = await profileRes.json();
    expect(profile.name).toBe("田中太郎");
    expect(profile.role).toBe("member");
  });

  it("パスワードリセットフロー: リセット要求 → トークンでパスワード変更 → 新パスワードでログイン", async () => {
    // 1. Request reset
    const resetReqRes = await req("POST", "/api/auth/password-reset/request", {
      body: { email: "admin@example.com" },
    });
    expect(resetReqRes.status).toBe(200);

    // 2. Get reset token from sent emails
    const emails = (container.emailService as InMemoryEmailService).getSentEmails();
    expect(emails.length).toBe(1);
    const resetToken = emails[0].token;

    // 3. Execute reset
    const resetExecRes = await req("POST", "/api/auth/password-reset/execute", {
      body: { token: resetToken, newPassword: "NewPass123" },
    });
    expect(resetExecRes.status).toBe(200);

    // 4. Login with new password
    const loginRes = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "NewPass123" },
    });
    expect(loginRes.status).toBe(200);
  });
});
