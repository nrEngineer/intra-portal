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

describe("UC-5: お知らせ削除", () => {
  let adminId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin();
    adminId = admin.id;
  });

  it("管理者がお知らせを削除できる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "削除テスト", body: "本文", category: "全社", status: "published", pinned: false },
    });
    const created = await createRes.json();

    const res = await req("DELETE", `/api/announcements/${created.id}`, { headers: adminHeaders });
    expect(res.status).toBe(200);

    const getRes = await req("GET", `/api/announcements/${created.id}`, { headers: adminHeaders });
    expect(getRes.status).toBe(404);
  });
});
