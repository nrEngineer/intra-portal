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

describe("UC-6: カテゴリ絞り込み", () => {
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

  it("カテゴリで一覧をフィルタできる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "IT通知", body: "IT", category: "IT", status: "published", pinned: false },
    });
    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "全社通知", body: "全社", category: "全社", status: "published", pinned: false },
    });

    const res = await req("GET", "/api/announcements?category=IT", { headers: memberHeaders });
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].category).toBe("IT");
  });
});
