import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin } from "./test-helpers.js";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", ...options.headers },
  };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

describe("UC-4: お知らせ編集", () => {
  let adminId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin();
    adminId = admin.id;
  });

  it("タイトル・本文・カテゴリを更新できる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "旧タイトル", body: "旧本文", category: "全社", status: "published", pinned: false },
    });
    const created = await createRes.json();

    const res = await req("PUT", `/api/announcements/${created.id}`, {
      headers: adminHeaders,
      body: { title: "新タイトル", body: "新本文", category: "IT" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("新タイトル");
    expect(data.body).toBe("新本文");
    expect(data.category).toBe("IT");
  });

  it("下書き→公開に切り替えできる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "下書き", body: "本文", category: "全社", status: "draft", pinned: false },
    });
    const created = await createRes.json();
    expect(created.publishedAt).toBeNull();

    const res = await req("PUT", `/api/announcements/${created.id}`, {
      headers: adminHeaders,
      body: { status: "published" },
    });
    const data = await res.json();
    expect(data.status).toBe("published");
    expect(data.publishedAt).not.toBeNull();
  });
});
