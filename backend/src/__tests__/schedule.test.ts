import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestAdmin, seedTestMember } from "./test-helpers.js";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";

const adminHeaders = { "x-user-id": "admin-1", "x-user-role": "admin" };
const memberHeaders = { "x-user-id": "member-1", "x-user-role": "member" };

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", ...options.headers } };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

// Helper: insert a team and return it
async function insertTeam(name: string, memberIds: string[]) {
  const now = new Date().toISOString();
  const [team] = await getDb()
    .insert(schema.teams)
    .values({ id: crypto.randomUUID(), name, createdAt: now })
    .returning();
  for (const userId of memberIds) {
    await getDb().insert(schema.teamMembers).values({
      id: crypto.randomUUID(),
      teamId: team.id,
      userId,
    });
  }
  return team;
}

// Helper: insert an event and return it
async function insertEvent(data: {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  teamId: string;
  createdBy: string;
  allDay: boolean;
}) {
  const now = new Date().toISOString();
  const [event] = await getDb()
    .insert(schema.scheduleEvents)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return event;
}

beforeAll(async () => {
  await setupTestDb();
});

describe("スケジュール", () => {
  let adminId: string;
  let memberId: string;

  beforeEach(async () => {
    await resetTestDb();
    // Seed real users so foreign key constraints on scheduleEvents.createdBy are satisfied
    const admin = await seedTestAdmin("Admin123");
    adminId = admin.id;
    const member = await seedTestMember("Member123");
    memberId = member.id;
  });

  it("チームを作成できる（管理者）", async () => {
    const res = await req("POST", "/api/schedule/teams", {
      headers: { "x-user-id": adminId, "x-user-role": "admin" },
      body: { name: "開発チーム", memberIds: [adminId, memberId] },
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("開発チーム");
  });

  it("自分が所属するチーム一覧を取得できる", async () => {
    await insertTeam("開発チーム", [memberId]);
    await insertTeam("営業チーム", [adminId]);

    const res = await req("GET", "/api/schedule/teams", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].name).toBe("開発チーム");
  });

  it("チームのイベントを作成・取得できる", async () => {
    const team = await insertTeam("開発チーム", [memberId]);

    const createRes = await req("POST", "/api/schedule/events", {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
      body: { title: "定例MTG", description: "週次", startAt: "2026-03-10T10:00:00Z", endAt: "2026-03-10T11:00:00Z", teamId: team.id, allDay: false },
    });
    expect(createRes.status).toBe(201);

    const listRes = await req("GET", `/api/schedule/events?teamId=${team.id}`, {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await listRes.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe("定例MTG");
  });

  it("日付範囲でイベントを絞り込みできる", async () => {
    const team = await insertTeam("チーム", [memberId]);
    await insertEvent({ title: "3月", description: "", startAt: "2026-03-15T10:00:00Z", endAt: "2026-03-15T11:00:00Z", teamId: team.id, createdBy: memberId, allDay: false });
    await insertEvent({ title: "4月", description: "", startAt: "2026-04-15T10:00:00Z", endAt: "2026-04-15T11:00:00Z", teamId: team.id, createdBy: memberId, allDay: false });

    const res = await req("GET", `/api/schedule/events?teamId=${team.id}&start=2026-03-01&end=2026-03-31`, {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe("3月");
  });

  it("イベントを更新・削除できる", async () => {
    const team = await insertTeam("チーム", [memberId]);
    const event = await insertEvent({ title: "旧MTG", description: "", startAt: "2026-03-10T10:00:00Z", endAt: "2026-03-10T11:00:00Z", teamId: team.id, createdBy: memberId, allDay: false });

    const updateRes = await req("PUT", `/api/schedule/events/${event.id}`, {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
      body: { title: "新MTG" },
    });
    expect(updateRes.status).toBe(200);
    expect((await updateRes.json()).title).toBe("新MTG");

    const deleteRes = await req("DELETE", `/api/schedule/events/${event.id}`, {
      headers: { "x-user-id": memberId, "x-user-role": "member" },
    });
    expect(deleteRes.status).toBe(200);
  });
});
