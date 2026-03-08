import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin, seedTestMember } from "./test-helpers.js";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", ...options.headers },
  };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

describe("UC-3: お知らせ作成", () => {
  let adminId: string;
  let memberId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin();
    adminId = admin.id;
    const member = await seedTestMember();
    memberId = member.id;
  });

  it("管理者が公開状態で作成できる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const res = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "年末休業", body: "12/29〜1/3", category: "全社", status: "published", pinned: false },
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.title).toBe("年末休業");
    expect(data.status).toBe("published");
    expect(data.publishedAt).not.toBeNull();
  });

  it("下書き状態で保存できる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const res = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "下書き", body: "まだ", category: "IT", status: "draft", pinned: false },
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe("draft");
    expect(data.publishedAt).toBeNull();
  });

  it("一般社員は403エラー", async () => {
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    const res = await req("POST", "/api/announcements", {
      headers: memberHeaders,
      body: { title: "不正", body: "NG", category: "全社", status: "published", pinned: false },
    });
    expect(res.status).toBe(403);
  });
});
