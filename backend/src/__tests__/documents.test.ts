import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../app.js";
import { setupTestDb, resetTestDb, seedTestMember, seedTestEditor, seedTestAdmin } from "./test-helpers.js";
import { getDb } from "../infrastructure/db/connection.js";
import * as schema from "../infrastructure/db/schema.js";
import { eq } from "drizzle-orm";

function req(method: string, path: string, options: { headers?: Record<string, string>; body?: unknown } = {}) {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", ...options.headers } };
  if (options.body) init.body = JSON.stringify(options.body);
  return app.request(path, init);
}

// Helper: insert a folder and return it
async function insertFolder(name: string, parentId: string | null, createdBy: string) {
  const now = new Date().toISOString();
  const [folder] = await getDb()
    .insert(schema.folders)
    .values({ id: crypto.randomUUID(), name, parentId, createdBy, createdAt: now })
    .returning();
  return folder;
}

// Helper: insert a document (with version 1) and return it
async function insertDocument(data: {
  title: string;
  folderId: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdBy: string;
}) {
  const now = new Date().toISOString();
  const [doc] = await getDb()
    .insert(schema.documents)
    .values({ id: crypto.randomUUID(), ...data, version: 1, createdAt: now, updatedAt: now })
    .returning();
  // Insert initial version record
  await getDb().insert(schema.documentVersions).values({
    id: crypto.randomUUID(),
    documentId: doc.id,
    version: 1,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    createdBy: data.createdBy,
    createdAt: now,
  });
  return doc;
}

// Helper: update document (bump version) and insert version record
async function updateDocument(
  docId: string,
  data: { fileUrl: string; fileName: string; fileSize: number },
  updatedBy: string,
) {
  const now = new Date().toISOString();
  const [current] = await getDb()
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, docId));
  const newVersion = current.version + 1;
  const [doc] = await getDb()
    .update(schema.documents)
    .set({ ...data, version: newVersion, updatedAt: now })
    .where(eq(schema.documents.id, docId))
    .returning();
  await getDb().insert(schema.documentVersions).values({
    id: crypto.randomUUID(),
    documentId: docId,
    version: newVersion,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    createdBy: updatedBy,
    createdAt: now,
  });
  return doc;
}

beforeAll(async () => {
  await setupTestDb();
});

describe("ドキュメント管理", () => {
  let memberId: string;
  let editorId: string;
  let adminId: string;

  beforeEach(async () => {
    await resetTestDb();
    const member = await seedTestMember("Member123");
    memberId = member.id;
    const editor = await seedTestEditor("Editor123");
    editorId = editor.id;
    const admin = await seedTestAdmin("Admin123");
    adminId = admin.id;
  });

  describe("フォルダ", () => {
    it("フォルダを作成できる（editor）", async () => {
      const res = await req("POST", "/api/documents/folders", {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
        body: { name: "プロジェクト資料", parentId: null },
      });
      expect(res.status).toBe(201);
      expect((await res.json()).name).toBe("プロジェクト資料");
    });

    it("フォルダ作成はmemberに拒否される", async () => {
      const res = await req("POST", "/api/documents/folders", {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
        body: { name: "プロジェクト資料", parentId: null },
      });
      expect(res.status).toBe(403);
    });

    it("サブフォルダを作成できる（階層）", async () => {
      const parentRes = await req("POST", "/api/documents/folders", {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
        body: { name: "親フォルダ", parentId: null },
      });
      const parent = await parentRes.json();

      const childRes = await req("POST", "/api/documents/folders", {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
        body: { name: "子フォルダ", parentId: parent.id },
      });
      expect(childRes.status).toBe(201);
      const child = await childRes.json();
      expect(child.parentId).toBe(parent.id);
    });

    it("フォルダ一覧を取得できる（ルートレベル）", async () => {
      await insertFolder("A", null, memberId);
      await insertFolder("B", null, memberId);

      const res = await req("GET", "/api/documents/folders", {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
      });
      const body = await res.json();
      expect(body.data.length).toBe(2);
    });

    it("空でないフォルダは削除できない（admin）", async () => {
      const folder = await insertFolder("親", null, memberId);
      await insertFolder("子", folder.id, memberId);

      const res = await req("DELETE", `/api/documents/folders/${folder.id}`, {
        headers: { "x-user-id": adminId, "x-user-role": "admin" },
      });
      expect(res.status).toBe(400);
    });

    it("フォルダ削除はeditorに拒否される", async () => {
      const folder = await insertFolder("削除テスト", null, editorId);

      const res = await req("DELETE", `/api/documents/folders/${folder.id}`, {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
      });
      expect(res.status).toBe(403);
    });

    it("空フォルダはadminが削除できる", async () => {
      const folder = await insertFolder("空フォルダ", null, adminId);

      const res = await req("DELETE", `/api/documents/folders/${folder.id}`, {
        headers: { "x-user-id": adminId, "x-user-role": "admin" },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("ドキュメント", () => {
    it("ドキュメントをアップロード（作成）できる（editor）", async () => {
      const res = await req("POST", "/api/documents", {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
        body: { title: "設計書", folderId: null, fileUrl: "https://r2.example.com/doc1.pdf", fileName: "design.pdf", fileSize: 1024000 },
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.version).toBe(1);
      expect(data.title).toBe("設計書");
    });

    it("ドキュメント作成はmemberに拒否される", async () => {
      const res = await req("POST", "/api/documents", {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
        body: { title: "設計書", folderId: null, fileUrl: "https://r2.example.com/doc1.pdf", fileName: "design.pdf", fileSize: 1024000 },
      });
      expect(res.status).toBe(403);
    });

    it("フォルダ内のドキュメントを取得できる", async () => {
      const folder = await insertFolder("資料", null, memberId);
      await insertDocument({ title: "A", folderId: folder.id, fileUrl: "https://r2/a.pdf", fileName: "a.pdf", fileSize: 100, createdBy: memberId });
      await insertDocument({ title: "B", folderId: null, fileUrl: "https://r2/b.pdf", fileName: "b.pdf", fileSize: 100, createdBy: memberId });

      const res = await req("GET", `/api/documents?folderId=${folder.id}`, {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
      });
      const body = await res.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].title).toBe("A");
    });

    it("ドキュメントを検索できる", async () => {
      await insertDocument({ title: "設計書2026", folderId: null, fileUrl: "https://r2/d.pdf", fileName: "design.pdf", fileSize: 100, createdBy: memberId });

      const res = await req("GET", "/api/documents?search=設計", {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
      });
      const body = await res.json();
      expect(body.data.length).toBe(1);
    });

    it("ドキュメント更新でバージョンが上がる（editor）", async () => {
      const doc = await insertDocument({ title: "設計書", folderId: null, fileUrl: "https://r2/v1.pdf", fileName: "v1.pdf", fileSize: 100, createdBy: editorId });

      const res = await req("PUT", `/api/documents/${doc.id}`, {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
        body: { fileUrl: "https://r2/v2.pdf", fileName: "v2.pdf", fileSize: 200 },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.version).toBe(2);
    });

    it("ドキュメント更新はmemberに拒否される", async () => {
      const doc = await insertDocument({ title: "設計書", folderId: null, fileUrl: "https://r2/v1.pdf", fileName: "v1.pdf", fileSize: 100, createdBy: memberId });

      const res = await req("PUT", `/api/documents/${doc.id}`, {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
        body: { fileUrl: "https://r2/v2.pdf", fileName: "v2.pdf", fileSize: 200 },
      });
      expect(res.status).toBe(403);
    });

    it("バージョン履歴を取得できる", async () => {
      const doc = await insertDocument({ title: "設計書", folderId: null, fileUrl: "https://r2/v1.pdf", fileName: "v1.pdf", fileSize: 100, createdBy: memberId });
      await updateDocument(doc.id, { fileUrl: "https://r2/v2.pdf", fileName: "v2.pdf", fileSize: 200 }, memberId);

      const res = await req("GET", `/api/documents/${doc.id}/versions`, {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
      });
      const body = await res.json();
      expect(body.data.length).toBe(2);
      expect(body.data[0].version).toBe(2); // newest first
    });

    it("ドキュメントを削除できる（admin）", async () => {
      const doc = await insertDocument({ title: "削除テスト", folderId: null, fileUrl: "https://r2/del.pdf", fileName: "del.pdf", fileSize: 100, createdBy: adminId });

      const res = await req("DELETE", `/api/documents/${doc.id}`, {
        headers: { "x-user-id": adminId, "x-user-role": "admin" },
      });
      expect(res.status).toBe(200);

      const getRes = await req("GET", `/api/documents/${doc.id}`, {
        headers: { "x-user-id": memberId, "x-user-role": "member" },
      });
      expect(getRes.status).toBe(404);
    });

    it("ドキュメント削除はeditorに拒否される", async () => {
      const doc = await insertDocument({ title: "削除テスト", folderId: null, fileUrl: "https://r2/del.pdf", fileName: "del.pdf", fileSize: 100, createdBy: editorId });

      const res = await req("DELETE", `/api/documents/${doc.id}`, {
        headers: { "x-user-id": editorId, "x-user-role": "editor" },
      });
      expect(res.status).toBe(403);
    });
  });
});
