import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin, seedTestMember } from "./test-helpers.js";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };
  if (options.body) {
    init.body = JSON.stringify(options.body);
  }
  return app.request(path, init);
}

describe("お知らせ機能 受け入れテスト", () => {
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

  describe("Acceptance: 管理者がお知らせを作成し、一般社員が閲覧できる", () => {
    it("管理者がお知らせを公開状態で作成 → 一覧に表示 → 詳細が閲覧でき既読になる", async () => {
      const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
      const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

      // 1. 管理者がお知らせを作成
      const createRes = await req("POST", "/api/announcements", {
        headers: adminHeaders,
        body: {
          title: "年末年始休業のお知らせ",
          body: "12/29〜1/3は休業です。",
          category: "全社",
          status: "published",
          pinned: false,
        },
      });
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      expect(created.id).toBeDefined();

      // 2. 一般社員が一覧を取得 → 作成したお知らせが含まれる
      const listRes = await req("GET", "/api/announcements", { headers: memberHeaders });
      expect(listRes.status).toBe(200);
      const list = await listRes.json();
      expect(list.data.some((a: { id: string }) => a.id === created.id)).toBe(true);

      // 3. 一般社員が詳細を取得 → 本文が読める & 既読になる
      const detailRes = await req("GET", `/api/announcements/${created.id}`, { headers: memberHeaders });
      expect(detailRes.status).toBe(200);
      const detail = await detailRes.json();
      expect(detail.title).toBe("年末年始休業のお知らせ");
      expect(detail.body).toBe("12/29〜1/3は休業です。");

      // 4. 未読件数が0になっている
      const unreadRes = await req("GET", "/api/announcements/unread-count", { headers: memberHeaders });
      expect(unreadRes.status).toBe(200);
      const unread = await unreadRes.json();
      expect(unread.count).toBe(0);
    });
  });

  describe("Acceptance: 権限制御が正しく動作する", () => {
    it("一般社員がお知らせを作成しようとすると403エラー", async () => {
      const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

      const res = await req("POST", "/api/announcements", {
        headers: memberHeaders,
        body: {
          title: "不正な投稿",
          body: "一般社員からの投稿",
          category: "全社",
          status: "published",
          pinned: false,
        },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("Acceptance: 下書きは一般社員に表示されない", () => {
    it("管理者が下書きを作成 → 一般社員の一覧には表示されない", async () => {
      const adminHeaders = { "x-user-id": adminId, "x-user-role": "admin" };
      const memberHeaders = { "x-user-id": memberId, "x-user-role": "member" };

      // 1. 管理者が下書きを作成
      const createRes = await req("POST", "/api/announcements", {
        headers: adminHeaders,
        body: {
          title: "下書きテスト",
          body: "まだ公開しない",
          category: "IT",
          status: "draft",
          pinned: false,
        },
      });
      expect(createRes.status).toBe(201);
      const created = await createRes.json();

      // 2. 一般社員の一覧には表示されない
      const listRes = await req("GET", "/api/announcements", { headers: memberHeaders });
      const list = await listRes.json();
      expect(list.data.some((a: { id: string }) => a.id === created.id)).toBe(false);

      // 3. 管理者の一覧には表示される（drafts=true）
      const adminListRes = await req("GET", "/api/announcements?drafts=true", { headers: adminHeaders });
      const adminList = await adminListRes.json();
      expect(adminList.data.some((a: { id: string }) => a.id === created.id)).toBe(true);
    });
  });
});
