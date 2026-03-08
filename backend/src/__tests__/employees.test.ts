import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin, seedTestMember } from "./test-helpers.js";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", ...options.headers } };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

beforeAll(async () => {
  await setupTestDb();
});

describe("社員名簿", () => {
  let adminId: string;
  let memberId: string;

  beforeEach(async () => {
    await resetTestDb();
    const admin = await seedTestAdmin("Admin123");
    adminId = admin.id;
    const member = await seedTestMember("Member123");
    memberId = member.id;
  });

  it("社員を登録できる（管理者）", async () => {
    const res = await req("POST", "/api/employees", {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
      body: { userId: adminId, name: "田中太郎", email: "tanaka@ex.com", department: "開発部", position: "エンジニア", photoUrl: null, phone: "090-1234", joinedAt: "2024-04-01" },
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("田中太郎");
    expect(data.department).toBe("開発部");
  });

  it("社員一覧を取得できる", async () => {
    const now = new Date().toISOString();
    await getDb().insert(schema.employees).values([
      { id: crypto.randomUUID(), userId: adminId, name: "田中", email: "t@ex.com", department: "開発部", position: "エンジニア", photoUrl: null, phone: "090", joinedAt: "2024-04-01", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), userId: memberId, name: "佐藤", email: "s@ex.com", department: "営業部", position: "マネージャー", photoUrl: null, phone: "080", joinedAt: "2023-04-01", createdAt: now, updatedAt: now },
    ]);

    const res = await req("GET", "/api/employees", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(2);
  });

  it("部署で絞り込みできる", async () => {
    const now = new Date().toISOString();
    await getDb().insert(schema.employees).values([
      { id: crypto.randomUUID(), userId: adminId, name: "田中", email: "t@ex.com", department: "開発部", position: "エンジニア", photoUrl: null, phone: "090", joinedAt: "2024-04-01", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), userId: memberId, name: "佐藤", email: "s@ex.com", department: "営業部", position: "マネージャー", photoUrl: null, phone: "080", joinedAt: "2023-04-01", createdAt: now, updatedAt: now },
    ]);

    const res = await req("GET", "/api/employees?department=開発部", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].department).toBe("開発部");
  });

  it("名前で検索できる", async () => {
    const now = new Date().toISOString();
    await getDb().insert(schema.employees).values({
      id: crypto.randomUUID(),
      userId: adminId,
      name: "田中太郎",
      email: "t@ex.com",
      department: "開発部",
      position: "エンジニア",
      photoUrl: null,
      phone: "090",
      joinedAt: "2024-04-01",
      createdAt: now,
      updatedAt: now,
    });

    const res = await req("GET", "/api/employees?search=田中", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data.length).toBe(1);
  });

  it("プロフィール写真URLを更新できる", async () => {
    const now = new Date().toISOString();
    const [emp] = await getDb().insert(schema.employees).values({
      id: crypto.randomUUID(),
      userId: adminId,
      name: "田中",
      email: "t@ex.com",
      department: "開発部",
      position: "エンジニア",
      photoUrl: null,
      phone: "090",
      joinedAt: "2024-04-01",
      createdAt: now,
      updatedAt: now,
    }).returning();

    const res = await req("PUT", `/api/employees/${emp.id}`, {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
      body: { photoUrl: "https://r2.example.com/photo.jpg" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.photoUrl).toBe("https://r2.example.com/photo.jpg");
  });

  it("一般社員は社員を登録できない", async () => {
    const res = await req("POST", "/api/employees", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
      body: { userId: null, name: "NG", email: "ng@ex.com", department: "X", position: "X", photoUrl: null, phone: "X", joinedAt: "2024-01-01" },
    });
    expect(res.status).toBe(403);
  });
});
