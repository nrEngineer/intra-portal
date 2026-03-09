# アーキテクチャリファクタリング仕様

## Story
社内ポータルの BE/FE を各スキル（hono-backend / react-frontend）のアーキテクチャに準拠するようリファクタリングする。
振る舞いは変更しない（既存113+37テスト全Green維持）。

## Example Map

### Rules
- R1: domain/ は純粋 TypeScript のみ（Hono/Drizzle の import 禁止）
- R2: application/ は domain/ にのみ依存（UseCase + Ports パターン）
- R3: infrastructure/ が Hono/Drizzle 等のフレームワーク固有コードを持つ
- R4: DI コンテナで依存性を注入
- R5: DomainException は status_code を持たない（ErrorCode → error-mapper）
- R6: 既存113 BE テスト全 Green 維持
- R7: Pages → Features → UI の3層構造
- R8: TanStack Query v5 でサーバー状態管理
- R9: fetch ベース薄ラッパー + apiClient パターン
- R10: 300行ルール（SchedulePage 440行 → 分割）
- R11: CSS Modules
- R12: 既存37 FE テスト全 Green 維持

### Questions: 0（全回答済み）

---

## BE リファクタリング仕様

### ターゲットディレクトリ構成

```
backend/src/
├── domain/
│   ├── models/
│   │   ├── user.ts
│   │   ├── announcement.ts
│   │   ├── employee.ts
│   │   ├── schedule-event.ts
│   │   ├── team.ts
│   │   ├── link.ts
│   │   └── document.ts
│   ├── errors/
│   │   ├── domain-error.ts          # base class + ErrorCode enum
│   │   ├── auth.errors.ts
│   │   ├── announcement.errors.ts
│   │   └── common.errors.ts
│   └── rules/
│       ├── auth.rules.ts            # パスワードバリデーション等
│       └── announcement.rules.ts    # 下書き/公開ルール等
├── application/
│   ├── ports/
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── announcement.repository.ts
│   │   │   ├── employee.repository.ts
│   │   │   ├── schedule.repository.ts
│   │   │   ├── link.repository.ts
│   │   │   └── document.repository.ts
│   │   ├── services/
│   │   │   ├── hash.service.ts
│   │   │   ├── token.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── storage.service.ts
│   │   └── unit-of-work.ts
│   └── usecases/
│       ├── auth/
│       │   ├── login.usecase.ts
│       │   ├── register.usecase.ts
│       │   ├── refresh-token.usecase.ts
│       │   ├── logout.usecase.ts
│       │   ├── reset-password-request.usecase.ts
│       │   ├── reset-password-execute.usecase.ts
│       │   ├── get-profile.usecase.ts
│       │   ├── update-profile.usecase.ts
│       │   ├── list-users.usecase.ts
│       │   ├── change-role.usecase.ts
│       │   ├── delete-user.usecase.ts
│       │   └── dto.ts
│       ├── announcement/
│       │   ├── list-announcements.usecase.ts
│       │   ├── get-announcement.usecase.ts
│       │   ├── create-announcement.usecase.ts
│       │   ├── update-announcement.usecase.ts
│       │   ├── delete-announcement.usecase.ts
│       │   ├── get-unread-count.usecase.ts
│       │   └── dto.ts
│       ├── employee/
│       │   ├── list-employees.usecase.ts
│       │   ├── register-employee.usecase.ts
│       │   ├── update-employee.usecase.ts
│       │   └── dto.ts
│       ├── schedule/
│       │   ├── list-events.usecase.ts
│       │   ├── create-event.usecase.ts
│       │   ├── update-event.usecase.ts
│       │   ├── delete-event.usecase.ts
│       │   ├── list-teams.usecase.ts
│       │   ├── create-team.usecase.ts
│       │   ├── update-team.usecase.ts
│       │   ├── delete-team.usecase.ts
│       │   └── dto.ts
│       ├── link/
│       │   ├── list-links.usecase.ts
│       │   ├── create-link.usecase.ts
│       │   ├── update-link.usecase.ts
│       │   ├── delete-link.usecase.ts
│       │   ├── list-categories.usecase.ts
│       │   └── dto.ts
│       └── document/
│           ├── list-folders.usecase.ts
│           ├── create-folder.usecase.ts
│           ├── update-folder.usecase.ts
│           ├── delete-folder.usecase.ts
│           ├── list-documents.usecase.ts
│           ├── create-document.usecase.ts
│           ├── update-document.usecase.ts
│           ├── delete-document.usecase.ts
│           ├── get-version-history.usecase.ts
│           ├── search-documents.usecase.ts
│           └── dto.ts
├── infrastructure/
│   ├── http/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── announcement.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   ├── schedule.routes.ts
│   │   │   ├── link.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   └── upload.routes.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   └── error-mapper.ts
│   ├── repositories/
│   │   ├── drizzle-user.repository.ts
│   │   ├── drizzle-announcement.repository.ts
│   │   ├── drizzle-employee.repository.ts
│   │   ├── drizzle-schedule.repository.ts
│   │   ├── drizzle-link.repository.ts
│   │   └── drizzle-document.repository.ts
│   ├── services/
│   │   ├── bcrypt-hash.service.ts
│   │   ├── jwt-token.service.ts
│   │   ├── console-email.service.ts
│   │   └── local-storage.service.ts
│   ├── db/
│   │   ├── schema.ts              # 既存維持
│   │   ├── connection.ts          # 既存維持
│   │   ├── create-tables.ts       # 既存維持
│   │   └── seed.ts                # 既存維持
│   └── drizzle-unit-of-work.ts
├── di/
│   └── container.ts
├── app.ts                          # Hono app (thin)
├── index.ts                        # entry point
└── worker.ts                       # CF Workers
```

### UC（Use Case）一覧

| ID | UseCase | 元の場所 | 変換内容 |
|----|---------|----------|----------|
| UC-A1 | LoginUseCase | auth.service.login() | ロック判定 → domain/rules, DB → ports |
| UC-A2 | RegisterUseCase | auth.service.register() | パスワード検証 → domain/rules |
| UC-A3 | RefreshTokenUseCase | auth.service.refreshToken() | トークン検証 → ports |
| UC-A4 | LogoutUseCase | auth.service.logout() | リフレッシュトークン削除 |
| UC-A5 | ResetPasswordRequestUseCase | auth.service.requestPasswordReset() | メール送信 → ports |
| UC-A6 | ResetPasswordExecuteUseCase | auth.service.resetPassword() | トークン検証 + パスワード更新 |
| UC-A7 | GetProfileUseCase | auth-routes GET /me | 自分の情報取得 |
| UC-A8 | UpdateProfileUseCase | auth-routes PUT /me | 名前更新 |
| UC-A9 | ListUsersUseCase | auth-routes GET /users | 管理者のみ |
| UC-A10 | ChangeRoleUseCase | auth-routes PUT /users/:id/role | ロール変更 |
| UC-A11 | DeleteUserUseCase | auth-routes DELETE /users/:id | ユーザー削除 |
| UC-N1 | ListAnnouncementsUseCase | announcement.service.list() | ページネーション + フィルタ |
| UC-N2 | GetAnnouncementUseCase | announcement.service.getById() | 詳細 + 既読マーク |
| UC-N3 | CreateAnnouncementUseCase | announcement.service.create() | 下書き/公開ルール |
| UC-N4 | UpdateAnnouncementUseCase | announcement.service.update() | 状態遷移ルール |
| UC-N5 | DeleteAnnouncementUseCase | announcement.service.delete() | 権限チェック |
| UC-N6 | GetUnreadCountUseCase | announcement.service.getUnreadCount() | 未読数取得 |
| UC-E1 | ListEmployeesUseCase | employee.service.list() | フィルタ + 検索 |
| UC-E2 | RegisterEmployeeUseCase | employee.service.register() | 社員登録 |
| UC-E3 | UpdateEmployeeUseCase | employee.service.update() | 社員更新 |
| UC-S1 | ListEventsUseCase | schedule.service.listEvents() | 日付範囲フィルタ |
| UC-S2 | CreateEventUseCase | schedule.service.createEvent() | イベント作成 |
| UC-S3 | UpdateEventUseCase | schedule.service.updateEvent() | イベント更新 |
| UC-S4 | DeleteEventUseCase | schedule.service.deleteEvent() | イベント削除 |
| UC-S5 | ListTeamsUseCase | schedule.service.listTeams() | チーム一覧 |
| UC-S6 | CreateTeamUseCase | schedule.service.createTeam() | チーム作成 |
| UC-S7 | UpdateTeamUseCase | schedule.service.updateTeam() | チーム更新 |
| UC-S8 | DeleteTeamUseCase | schedule.service.deleteTeam() | チーム削除 |
| UC-L1 | ListLinksUseCase | link.service.list() | カテゴリフィルタ |
| UC-L2 | CreateLinkUseCase | link.service.create() | リンク作成 |
| UC-L3 | UpdateLinkUseCase | link.service.update() | リンク更新 |
| UC-L4 | DeleteLinkUseCase | link.service.delete() | リンク削除 |
| UC-L5 | ListCategoriesUseCase | link.service.listCategories() | カテゴリ一覧 |
| UC-D1 | ListFoldersUseCase | document.service.listFolders() | フォルダ一覧 |
| UC-D2 | CreateFolderUseCase | document.service.createFolder() | フォルダ作成 |
| UC-D3 | UpdateFolderUseCase | document.service.updateFolder() | フォルダ更新 |
| UC-D4 | DeleteFolderUseCase | document.service.deleteFolder() | フォルダ削除 |
| UC-D5 | ListDocumentsUseCase | document.service.listDocuments() | ドキュメント一覧 |
| UC-D6 | CreateDocumentUseCase | document.service.createDocument() | ドキュメント作成 |
| UC-D7 | UpdateDocumentUseCase | document.service.updateDocument() | バージョン管理 |
| UC-D8 | DeleteDocumentUseCase | document.service.deleteDocument() | ドキュメント削除 |
| UC-D9 | GetVersionHistoryUseCase | document.service.getVersionHistory() | 版履歴 |
| UC-D10 | SearchDocumentsUseCase | document.service.searchDocuments() | 検索 |

### 状態パターン (S)
| ID | パターン | 元の場所 |
|----|---------|----------|
| S-1 | パスワードバリデーション | auth.service (インライン) → domain/rules/auth.rules.ts |
| S-2 | アカウントロック (5回失敗→ロック) | auth.service → domain/rules/auth.rules.ts |
| S-3 | 下書き/公開状態遷移 | announcement.service → domain/rules/announcement.rules.ts |
| S-4 | ファイルアップロード制約 | routes (インライン) → domain/rules/upload.rules.ts |

---

## FE リファクタリング仕様

### ターゲットディレクトリ構成

```
frontend/src/
├── lib/
│   └── api/
│       ├── client.ts              # fetch ベース apiClient
│       ├── use-api-query.ts       # TanStack Query ラッパー
│       └── use-api-mutation.ts    # TanStack Query ラッパー
├── types/
│   ├── auth.d.ts
│   ├── announcement.d.ts
│   ├── employee.d.ts
│   ├── schedule.d.ts
│   ├── link.d.ts
│   └── document.d.ts
├── hooks/
│   ├── use-auth.ts                # 既存改善
│   ├── use-toggle.ts
│   └── use-debounce.ts
├── components/
│   ├── ui/                        # 汎用 UI
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── Pagination.tsx
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── Layout.module.css
│   └── features/
│       ├── announcements/
│       │   ├── hooks.ts           # useAnnouncements, useCreateAnnouncement 等
│       │   ├── AnnouncementList.tsx
│       │   ├── AnnouncementForm.tsx
│       │   ├── AnnouncementFilters.tsx
│       │   └── announcements.module.css
│       ├── schedule/
│       │   ├── hooks.ts
│       │   ├── Calendar.tsx
│       │   ├── EventForm.tsx
│       │   ├── EventDetail.tsx
│       │   ├── TeamManagement.tsx
│       │   └── schedule.module.css
│       ├── documents/
│       │   ├── hooks.ts
│       │   ├── FolderTree.tsx
│       │   ├── DocumentList.tsx
│       │   ├── DocumentForm.tsx
│       │   └── documents.module.css
│       ├── employees/
│       │   ├── hooks.ts
│       │   ├── EmployeeList.tsx
│       │   ├── EmployeeForm.tsx
│       │   └── employees.module.css
│       ├── links/
│       │   ├── hooks.ts
│       │   ├── LinkGrid.tsx
│       │   ├── LinkForm.tsx
│       │   └── links.module.css
│       ├── users/
│       │   ├── hooks.ts
│       │   ├── UserTable.tsx
│       │   ├── UserCreateForm.tsx
│       │   └── users.module.css
│       └── dashboard/
│           ├── hooks.ts
│           ├── DashboardCards.tsx
│           └── dashboard.module.css
├── pages/
│   ├── LoginPage.tsx              # 軽微変更のみ
│   ├── DashboardPage.tsx          # Container のみ
│   ├── AnnouncementsPage.tsx      # Container のみ
│   ├── AnnouncementDetailPage.tsx # Container のみ
│   ├── SchedulePage.tsx           # Container のみ
│   ├── DocumentsPage.tsx          # Container のみ
│   ├── EmployeesPage.tsx          # Container のみ
│   ├── LinksPage.tsx              # Container のみ
│   └── UsersPage.tsx              # Container のみ
├── providers/
│   ├── AuthProvider.tsx
│   └── QueryProvider.tsx          # TanStack Query Provider
├── App.tsx
└── main.tsx
```

---

## Test List

### BE テスト（既存113テスト + 構造変更）

| # | テスト | 種別 | 状態 |
|---|--------|------|------|
| T1 | 既存 auth-uc.test.ts (23テスト) → 新構造で全パス | 移行 | ☐ |
| T2 | 既存 auth-state.test.ts (7テスト) → 新構造で全パス | 移行 | ☐ |
| T3 | 既存 auth.acceptance.test.ts (2テスト) → 全パス | 移行 | ☐ |
| T4 | 既存 uc1〜uc7.test.ts (13テスト) → 全パス | 移行 | ☐ |
| T5 | 既存 state-patterns.test.ts (8テスト) → 全パス | 移行 | ☐ |
| T6 | 既存 announcements.acceptance.test.ts (3テスト) → 全パス | 移行 | ☐ |
| T7 | 既存 employees.test.ts (6テスト) → 全パス | 移行 | ☐ |
| T8 | 既存 schedule.test.ts (5テスト) → 全パス | 移行 | ☐ |
| T9 | 既存 links.test.ts (7テスト) → 全パス | 移行 | ☐ |
| T10 | 既存 documents.test.ts (11テスト) → 全パス | 移行 | ☐ |
| T11 | domain/rules ユニットテスト（純粋関数） | 新規 | ☐ |
| T12 | lint + typecheck エラー 0 | 品質 | ☐ |

### FE テスト（既存37テスト + 構造変更）

| # | テスト | 種別 | 状態 |
|---|--------|------|------|
| T13 | 既存10テストファイル (37テスト) → 新構造で全パス | 移行 | ☐ |
| T14 | TanStack Query Provider でのテスト動作 | 新規 | ☐ |
| T15 | lint + typecheck エラー 0 | 品質 | ☐ |

合計: 初期15項目
