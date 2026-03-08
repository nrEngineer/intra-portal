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

describe("UC-1: お知らせ一覧表示", () => {
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

  it("公開済みお知らせが新着順で返る", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    // Setup: create 2 announcements with different dates
    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "古いお知らせ", body: "本文1", category: "全社", status: "published", pinned: false },
    });
    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "新しいお知らせ", body: "本文2", category: "IT", status: "published", pinned: false },
    });

    const res = await req("GET", "/api/announcements", { headers: memberHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    // Newest first
    const titles = body.data.map((a: { title: string }) => a.title);
    expect(titles.indexOf("新しいお知らせ")).toBeLessThan(titles.indexOf("古いお知らせ"));
  });

  it("ピン留めが最上部に表示される", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "通常のお知らせ", body: "本文", category: "全社", status: "published", pinned: false },
    });
    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "ピン留めお知らせ", body: "重要", category: "全社", status: "published", pinned: true },
    });

    const res = await req("GET", "/api/announcements", { headers: memberHeaders });
    const body = await res.json();
    expect(body.data[0].title).toBe("ピン留めお知らせ");
  });

  it("下書きは一般社員に表示されない", async () => {
    const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
    const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

    await req("POST", "/api/announcements", {
      headers: adminHeaders,
      body: { title: "下書き", body: "非公開", category: "全社", status: "draft", pinned: false },
    });

    const res = await req("GET", "/api/announcements", { headers: memberHeaders });
    const body = await res.json();
    const drafts = body.data.filter((a: { title: string }) => a.title === "下書き");
    expect(drafts.length).toBe(0);
  });
});
