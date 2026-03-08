# 社内ポータルサイト (Intra Portal)

社内の情報共有・業務効率化を目的としたポータルサイトです。

## 機能一覧

| 機能 | 説明 | 権限 |
|------|------|------|
| お知らせ | CRUD・ピン留め・下書き/公開・既読管理・添付ファイル・検索 | 閲覧: 全員 / 管理: admin |
| ユーザー認証 | JWT認証・アカウントロック・パスワードリセット | - |
| 社員名簿 | 検索・部署フィルタ・プロフィール管理 | 閲覧: 全員 / 管理: admin |
| スケジュール | チーム管理・カレンダーUI・日付範囲フィルタ | 全員 |
| リンク集 | カテゴリ別社内リンク管理 | 閲覧: 全員 / 管理: editor, admin |
| ドキュメント管理 | フォルダ階層・バージョン管理・検索 | 全員 |

## 技術スタック

```
Frontend : React 19 + Vite + TypeScript
Backend  : Hono + TypeScript (Node.js)
Database : SQLite (Drizzle ORM / @libsql/client)
Test     : Vitest (113 tests)
Package  : pnpm monorepo
Deploy   : Docker (ローカル) / Cloudflare Workers + Pages + D1 (本番)
```

## セットアップ

### 前提条件

- Node.js 22+
- pnpm 10+

### インストール

```bash
git clone https://github.com/nrEngineer/intra-portal.git
cd intra-portal
pnpm install
```

### 開発サーバー起動

```bash
# バックエンド (http://localhost:3000)
cd backend
cp .env.example .env
pnpm dev

# フロントエンド (http://localhost:5173)
cd frontend
pnpm dev
```

### Docker で起動

```bash
docker compose up --build
# Backend  → http://localhost:3000
# Frontend → http://localhost:5173
```

### データベース初期化

サーバー起動時に自動でテーブル作成・初期データ投入されます。手動で実行する場合：

```bash
cd backend
pnpm db:setup   # スキーマ反映 + 初期データ
```

## 初期ログインアカウント

| ロール | メールアドレス | パスワード |
|--------|---------------|-----------|
| 管理者 | admin@example.com | admin123 |
| エディター | editor@example.com | editor123 |
| 一般 | member@example.com | member123 |

## テスト

```bash
# バックエンド (76 tests)
cd backend && pnpm test

# フロントエンド (37 tests)
cd frontend && pnpm test
```

## プロジェクト構成

```
intra-portal/
├── backend/
│   └── src/
│       ├── routes.ts           # お知らせ API
│       ├── auth-routes.ts      # 認証・ユーザー管理 API
│       ├── employee-routes.ts  # 社員名簿 API
│       ├── schedule-routes.ts  # スケジュール API
│       ├── link-routes.ts      # リンク集 API
│       ├── document-routes.ts  # ドキュメント管理 API
│       ├── upload-routes.ts    # ファイルアップロード API
│       ├── middleware.ts       # 認証ミドルウェア
│       ├── auth-utils.ts       # JWT・パスワード ユーティリティ
│       └── db/
│           ├── schema.ts       # Drizzle ORM スキーマ (14テーブル)
│           ├── connection.ts   # DB接続管理
│           ├── create-tables.ts
│           └── seed.ts         # 初期データ
├── frontend/
│   └── src/
│       ├── pages/              # 各画面コンポーネント
│       ├── components/         # 共通コンポーネント
│       ├── hooks/useAuth.ts    # 認証フック
│       └── lib/api.ts          # APIクライアント
├── docker-compose.yml
├── Dockerfile
└── pnpm-workspace.yaml
```

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/refresh` | トークン更新 |
| POST | `/api/auth/logout` | ログアウト |
| POST | `/api/auth/password-reset/request` | パスワードリセット要求 |
| POST | `/api/auth/password-reset/execute` | パスワードリセット実行 |
| GET | `/api/users` | ユーザー一覧 (admin) |
| POST | `/api/users` | ユーザー作成 (admin) |
| GET/PUT | `/api/users/me` | プロフィール取得・更新 |
| GET | `/api/announcements` | お知らせ一覧 |
| GET | `/api/announcements/unread-count` | 未読数 |
| GET/POST/PUT/DELETE | `/api/announcements/:id` | お知らせ CRUD |
| GET/POST | `/api/employees` | 社員一覧・登録 |
| GET/PUT | `/api/employees/:id` | 社員詳細・更新 |
| GET/POST | `/api/schedule/teams` | チーム管理 |
| GET/POST/PUT/DELETE | `/api/schedule/events` | イベント管理 |
| GET/POST/PUT/DELETE | `/api/links` | リンク管理 |
| GET | `/api/links/categories` | カテゴリ一覧 |
| GET/POST/PUT/DELETE | `/api/documents` | ドキュメント管理 |
| GET/POST/DELETE | `/api/documents/folders` | フォルダ管理 |
| POST/DELETE | `/api/uploads` | ファイルアップロード |

## ライセンス

MIT
