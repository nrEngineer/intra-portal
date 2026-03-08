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

describe("UC-2: お知らせ詳細表示", () => {
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

  it("お知らせ本文と添付ファイルが返る", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "テスト", body: "詳細本文", category: "全社", status: "published", pinned: false },
    });
    const created = await createRes.json();

    const res = await req("GET", `/api/announcements/${created.id}`, { headers: memberHeaders });
    expect(res.status).toBe(200);
    const detail = await res.json();
    expect(detail.title).toBe("テスト");
    expect(detail.body).toBe("詳細本文");
    expect(detail.attachments).toBeDefined();
  });

  it("表示時に既読状態が記録される", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "未読テスト", body: "本文", category: "全社", status: "published", pinned: false },
    });
    const created = await createRes.json();

    // Before viewing: unread count should be 1
    const beforeRes = await req("GET", "/api/announcements/unread-count", { headers: memberHeaders });
    const before = await beforeRes.json();
    expect(before.count).toBe(1);

    // View detail
    await req("GET", `/api/announcements/${created.id}`, { headers: memberHeaders });

    // After viewing: unread count should be 0
    const afterRes = await req("GET", "/api/announcements/unread-count", { headers: memberHeaders });
    const after = await afterRes.json();
    expect(after.count).toBe(0);
  });
});
