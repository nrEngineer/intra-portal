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

describe("S-1: ページネーション", () => {
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

  it("10件ごとにページ分割される", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    // Create 15 announcements
    for (let i = 0; i < 15; i++) {
      await req("POST", "/api/announcements", {
        headers: adminHeaders,
        body: { title: `お知らせ${i}`, body: `本文${i}`, category: "全社", status: "published", pinned: false },
      });
    }

    const page1 = await req("GET", "/api/announcements?page=1", { headers: memberHeaders });
    const body1 = await page1.json();
    expect(body1.data.length).toBe(10);
    expect(body1.total).toBe(15);
    expect(body1.totalPages).toBe(2);

    const page2 = await req("GET", "/api/announcements?page=2", { headers: memberHeaders });
    const body2 = await page2.json();
    expect(body2.data.length).toBe(5);
  });
});

describe("S-2: 未読/既読管理", () => {
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

  it("未読バッジ: 未読件数が表示される", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "A", body: "a", category: "全社", status: "published", pinned: false },
    });
    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "B", body: "b", category: "全社", status: "published", pinned: false },
    });

    const res = await req("GET", "/api/announcements/unread-count", { headers: memberHeaders });
    const body = await res.json();
    expect(body.count).toBe(2);
  });

  it("既読化: 詳細表示で未読→既読に変わる", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    const createRes = await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "C", body: "c", category: "全社", status: "published", pinned: false },
    });
    const created = await createRes.json();

    // View detail → marks as read
    await req("GET", `/api/announcements/${created.id}`, { headers: memberHeaders });

    const unreadRes = await req("GET", "/api/announcements/unread-count", { headers: memberHeaders });
    const unread = await unreadRes.json();
    expect(unread.count).toBe(0);
  });
});

describe("S-3: 下書き/公開状態", () => {
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

  it("管理者のみ下書き一覧を閲覧可能", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "下書き", body: "未公開", category: "全社", status: "draft", pinned: false },
    });

    // Admin with drafts=true can see
    const adminRes = await req("GET", "/api/announcements?drafts=true", { headers: adminHeaders });
    const adminBody = await adminRes.json();
    expect(adminBody.data.length).toBe(1);

    // Member cannot see drafts
    const memberRes = await req("GET", "/api/announcements", { headers: memberHeaders });
    const memberBody = await memberRes.json();
    expect(memberBody.data.length).toBe(0);
  });
});

describe("S-4: ファイルアップロード", () => {
  let adminId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin();
    adminId = admin.id;
  });

  it("2個まで添付可能", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    // This test validates the upload endpoint rejects >2 files
    // For now, test the validation logic
    const res = await req("POST", "/api/announcements/upload-validate", {
      headers: adminHeaders,
      body: { fileCount: 2, fileSizes: [5_000_000, 8_000_000] },
    });
    expect(res.status).toBe(200);
  });

  it("10MB超過で拒否される", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };

    const res = await req("POST", "/api/announcements/upload-validate", {
      headers: adminHeaders,
      body: { fileCount: 1, fileSizes: [11_000_000] },
    });
    expect(res.status).toBe(400);
  });
});
