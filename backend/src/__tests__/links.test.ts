import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin, seedTestEditor, seedTestMember } from "./test-helpers.js";
import { getDb } from "../infrastructure/db/connection.js";
import * as schema from "../infrastructure/db/schema.js";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", ...options.headers } };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

beforeAll(async () => {
  await setupTestDb();
});

describe("社内リンク集", () => {
  let adminId: string;
  let editorId: string;
  let memberId: string;

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin("Admin123");
    adminId = admin.id;
    const editor = await seedTestEditor("Editor123");
    editorId = editor.id;
    const member = await seedTestMember("Member123");
    memberId = member.id;
  });

  it("管理者がリンクを作成できる", async () => {
    const res = await req("POST", "/api/links", {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
      body: { title: "勤怠管理", url: "https://kintai.example.com", description: "勤怠入力", category: "業務ツール", sortOrder: 1 },
    });
    expect(res.status).toBe(201);
    expect((await res.json()).title).toBe("勤怠管理");
  });

  it("editorがリンクを作成できる", async () => {
    const res = await req("POST", "/api/links", {
      headers: { "x-user-id": editorId, "x-user-role": "editor" },
      body: { title: "Wiki", url: "https://wiki.example.com", description: "社内Wiki", category: "ドキュメント", sortOrder: 1 },
    });
    expect(res.status).toBe(201);
  });

  it("一般社員はリンクを作成できない", async () => {
    const res = await req("POST", "/api/links", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
      body: { title: "NG", url: "https://ng.com", description: "NG", category: "X", sortOrder: 1 },
    });
    expect(res.status).toBe(403);
  });

  it("カテゴリ別にリンクを取得できる", async () => {
    const now = new Date().toISOString();
    await getDb().insert(schema.internalLinks).values([
      { id: crypto.randomUUID(), title: "A", url: "https://a.com", description: "a", category: "業務ツール", sortOrder: 1, createdBy: adminId, createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "B", url: "https://b.com", description: "b", category: "ドキュメント", sortOrder: 1, createdBy: adminId, createdAt: now, updatedAt: now },
    ]);

    const res = await req("GET", "/api/links?category=業務ツール", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].category).toBe("業務ツール");
  });

  it("カテゴリ一覧を取得できる", async () => {
    const now = new Date().toISOString();
    await getDb().insert(schema.internalLinks).values([
      { id: crypto.randomUUID(), title: "A", url: "https://a.com", description: "a", category: "業務ツール", sortOrder: 1, createdBy: adminId, createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "B", url: "https://b.com", description: "b", category: "ドキュメント", sortOrder: 1, createdBy: adminId, createdAt: now, updatedAt: now },
    ]);

    const res = await req("GET", "/api/links/categories", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data).toContain("業務ツール");
    expect(body.data).toContain("ドキュメント");
  });

  it("リンクを更新・削除できる", async () => {
    const now = new Date().toISOString();
    const [link] = await getDb().insert(schema.internalLinks).values({
      id: crypto.randomUUID(),
      title: "旧",
      url: "https://old.com",
      description: "old",
      category: "X",
      sortOrder: 1,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    }).returning();

    const updateRes = await req("PUT", `/api/links/${link.id}`, {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
      body: { title: "新" },
    });
    expect(updateRes.status).toBe(200);
    expect((await updateRes.json()).title).toBe("新");

    const deleteRes = await req("DELETE", `/api/links/${link.id}`, {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
    });
    expect(deleteRes.status).toBe(200);
  });
});
