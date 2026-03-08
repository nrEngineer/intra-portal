import bcryptjs from "bcryptjs";
import * as schema from "./schema.js";
import type { AppDatabase } from "./connection.js";

export async function seed(db: AppDatabase): Promise<void> {
  // 管理者
  const adminHash = await bcryptjs.hash("admin123", 10);
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@example.com",
      name: "管理者",
      passwordHash: adminHash,
      role: "admin",
    })
    .returning();

  // 一般ユーザー
  const memberHash = await bcryptjs.hash("member123", 10);
  const [member] = await db
    .insert(schema.users)
    .values({
      email: "member@example.com",
      name: "一般ユーザー",
      passwordHash: memberHash,
      role: "member",
    })
    .returning();

  // エディター
  const editorHash = await bcryptjs.hash("editor123", 10);
  const [editor] = await db
    .insert(schema.users)
    .values({
      email: "editor@example.com",
      name: "エディター",
      passwordHash: editorHash,
      role: "editor",
    })
    .returning();

  // お知らせ
  await db.insert(schema.announcements).values([
    {
      title: "社内ポータルサイトがオープンしました",
      body: "本日より社内ポータルサイトの運用を開始します。",
      category: "全社",
      status: "published",
      pinned: true,
      createdBy: admin.id,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "年末調整の手続きについて",
      body: "年末調整の書類提出期限は12月15日です。",
      category: "総務",
      status: "published",
      createdBy: admin.id,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "システムメンテナンスのお知らせ",
      body: "1月10日 22:00〜翌6:00までメンテナンスを実施します。",
      category: "IT",
      status: "published",
      createdBy: admin.id,
      publishedAt: new Date().toISOString(),
    },
  ]);

  // 社員
  await db.insert(schema.employees).values([
    {
      userId: admin.id,
      name: "管理者太郎",
      email: "admin@example.com",
      department: "情報システム部",
      position: "部長",
      phone: "03-1234-5678",
      joinedAt: "2015-04-01",
    },
    {
      userId: member.id,
      name: "社員花子",
      email: "member@example.com",
      department: "営業部",
      position: "主任",
      phone: "03-2345-6789",
      joinedAt: "2020-04-01",
    },
    {
      userId: editor.id,
      name: "編集次郎",
      email: "editor@example.com",
      department: "広報部",
      position: "担当",
      phone: "03-3456-7890",
      joinedAt: "2022-04-01",
    },
  ]);

  // チーム
  const [devTeam] = await db
    .insert(schema.teams)
    .values({ name: "開発チーム" })
    .returning();
  const [salesTeam] = await db
    .insert(schema.teams)
    .values({ name: "営業チーム" })
    .returning();

  await db.insert(schema.teamMembers).values([
    { teamId: devTeam.id, userId: admin.id },
    { teamId: salesTeam.id, userId: member.id },
    { teamId: devTeam.id, userId: editor.id },
  ]);

  // スケジュール
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(schema.scheduleEvents).values([
    {
      title: "週次定例ミーティング",
      description: "今週の進捗報告",
      startAt: nextWeek.toISOString(),
      endAt: new Date(nextWeek.getTime() + 3600000).toISOString(),
      teamId: devTeam.id,
      createdBy: admin.id,
    },
    {
      title: "営業戦略会議",
      description: "Q2の営業計画",
      startAt: nextWeek.toISOString(),
      endAt: new Date(nextWeek.getTime() + 7200000).toISOString(),
      teamId: salesTeam.id,
      createdBy: member.id,
    },
  ]);

  // リンク
  await db.insert(schema.internalLinks).values([
    {
      title: "Slack",
      url: "https://workspace.slack.com",
      description: "社内チャットツール",
      category: "業務ツール",
      sortOrder: 1,
      createdBy: admin.id,
    },
    {
      title: "Google Workspace",
      url: "https://workspace.google.com",
      description: "メール・ドキュメント",
      category: "業務ツール",
      sortOrder: 2,
      createdBy: admin.id,
    },
    {
      title: "勤怠管理",
      url: "https://kintai.example.com",
      description: "勤怠管理システム",
      category: "社内システム",
      sortOrder: 1,
      createdBy: admin.id,
    },
    {
      title: "経費精算",
      url: "https://expense.example.com",
      description: "経費精算システム",
      category: "社内システム",
      sortOrder: 2,
      createdBy: admin.id,
    },
  ]);

  // フォルダ
  const [rulesFolder] = await db
    .insert(schema.folders)
    .values({ name: "規程集", parentId: null, createdBy: admin.id })
    .returning();
  const [templatesFolder] = await db
    .insert(schema.folders)
    .values({ name: "テンプレート", parentId: null, createdBy: admin.id })
    .returning();

  // ドキュメント
  await db.insert(schema.documents).values([
    {
      title: "就業規則",
      folderId: rulesFolder.id,
      fileUrl: "/uploads/rules.pdf",
      fileName: "rules.pdf",
      fileSize: 1024000,
      version: 1,
      createdBy: admin.id,
    },
    {
      title: "出張申請書",
      folderId: templatesFolder.id,
      fileUrl: "/uploads/travel-request.xlsx",
      fileName: "travel-request.xlsx",
      fileSize: 51200,
      version: 1,
      createdBy: admin.id,
    },
  ]);
}

// Standalone seed script
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  import("dotenv/config").then(async () => {
    const { initDb } = await import("./connection.js");
    const { createTables } = await import("./create-tables.js");
    const db = await initDb();
    await createTables(db);
    await seed(db);
    console.log("Seed completed!");
    const { closeDb } = await import("./connection.js");
    closeDb();
  });
}
