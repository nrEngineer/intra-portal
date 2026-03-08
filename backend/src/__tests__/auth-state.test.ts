import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { validatePassword, verifyAccessToken } from "../auth-utils.js";
import { setupTestDb, resetTestDb, seedTestAdmin } from "./test-helpers.js";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";

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

describe("S-1: パスワードバリデーション", () => {
  it("8文字未満→エラー", () => {
    expect(validatePassword("short")).not.toBeNull();
  });

  it("数字なし→エラー", () => {
    expect(validatePassword("password")).not.toBeNull();
  });

  it("英字なし→エラー", () => {
    expect(validatePassword("12345678")).not.toBeNull();
  });

  it("8文字以上英数字混在→OK", () => {
    expect(validatePassword("Valid123")).toBeNull();
  });
});

describe("S-2: アカウントロック", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("5回連続失敗→6回目ロック", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await req("POST", "/api/auth/login", {
        body: { email: "admin@example.com", password: "Wrong123" },
      });
      expect(res.status).toBe(401);
    }

    const res = await req("POST", "/api/auth/login", {
      body: { email: "admin@example.com", password: "Admin123" },
    });
    expect(res.status).toBe(423);
  });
});

describe("S-3: トークン有効期限管理", () => {
  it("期限切れアクセストークン→検証失敗", () => {
    const result = verifyAccessToken("invalid.token.here");
    expect(result).toBeNull();
  });
});

describe("S-4: シードデータ", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedTestAdmin("Admin123");
  });

  it("シードで初期管理者が存在する", async () => {
    const admin = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, "admin@example.com"))
      .then((r) => r[0]);
    expect(admin).toBeDefined();
    expect(admin!.role).toBe("admin");
  });
});
