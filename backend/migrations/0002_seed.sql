-- Seed data
INSERT INTO users (id, email, name, password_hash, role, failed_attempts, created_at, updated_at) VALUES
  ('u-admin-001', 'admin@example.com', '管理者', '$2b$10$JRAfWBBoRhBv30H0hqRuG.U23iltB0OXVz7QwM8.ZHKrnSdseF9/6', 'admin', 0, '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('u-member-001', 'member@example.com', '一般ユーザー', '$2b$10$kudPbVCVk28nHh5zAWWIuum.hOTX6KRYf0JgnXPqW56GbpuaLZOSq', 'member', 0, '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('u-editor-001', 'editor@example.com', 'エディター', '$2b$10$zpyxKZUAKbinrovrHnXftuEoj0aUwbBHs32kMzABeKtrEeAA1EUNq', 'editor', 0, '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

INSERT INTO announcements (id, title, body, category, status, pinned, created_by, published_at, created_at, updated_at) VALUES
  ('a-001', '社内ポータルサイトがオープンしました', '本日より社内ポータルサイトの運用を開始します。', '全社', 'published', 1, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('a-002', '年末調整の手続きについて', '年末調整の書類提出期限は12月15日です。', '総務', 'published', 0, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('a-003', 'システムメンテナンスのお知らせ', '1月10日 22:00〜翌6:00までメンテナンスを実施します。', 'IT', 'published', 0, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

INSERT INTO employees (id, user_id, name, email, department, position, phone, joined_at, created_at, updated_at) VALUES
  ('e-001', 'u-admin-001', '管理者太郎', 'admin@example.com', '情報システム部', '部長', '03-1234-5678', '2015-04-01', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('e-002', 'u-member-001', '社員花子', 'member@example.com', '営業部', '主任', '03-2345-6789', '2020-04-01', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('e-003', 'u-editor-001', '編集次郎', 'editor@example.com', '広報部', '担当', '03-3456-7890', '2022-04-01', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

INSERT INTO teams (id, name, created_at) VALUES
  ('t-dev-001', '開発チーム', '2026-03-08T09:23:21.145Z'),
  ('t-sales-001', '営業チーム', '2026-03-08T09:23:21.145Z');

INSERT INTO team_members (id, team_id, user_id) VALUES
  ('tm-001', 't-dev-001', 'u-admin-001'),
  ('tm-002', 't-sales-001', 'u-member-001'),
  ('tm-003', 't-dev-001', 'u-editor-001');

INSERT INTO schedule_events (id, title, description, start_at, end_at, team_id, created_by, all_day, created_at, updated_at) VALUES
  ('se-001', '週次定例ミーティング', '今週の進捗報告', '2026-03-15T09:23:21.146Z', '2026-03-15T10:23:21.146Z', 't-dev-001', 'u-admin-001', 0, '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('se-002', '営業戦略会議', 'Q2の営業計画', '2026-03-15T09:23:21.146Z', '2026-03-15T11:23:21.146Z', 't-sales-001', 'u-member-001', 0, '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

INSERT INTO internal_links (id, title, url, description, category, sort_order, created_by, created_at, updated_at) VALUES
  ('l-001', 'Slack', 'https://workspace.slack.com', '社内チャットツール', '業務ツール', 1, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('l-002', 'Google Workspace', 'https://workspace.google.com', 'メール・ドキュメント', '業務ツール', 2, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('l-003', '勤怠管理', 'https://kintai.example.com', '勤怠管理システム', '社内システム', 1, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('l-004', '経費精算', 'https://expense.example.com', '経費精算システム', '社内システム', 2, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

INSERT INTO folders (id, name, parent_id, created_by, created_at) VALUES
  ('f-rules-001', '規程集', NULL, 'u-admin-001', '2026-03-08T09:23:21.145Z'),
  ('f-tmpl-001', 'テンプレート', NULL, 'u-admin-001', '2026-03-08T09:23:21.145Z');

INSERT INTO documents (id, title, folder_id, file_url, file_name, file_size, version, created_by, created_at, updated_at) VALUES
  ('d-001', '就業規則', 'f-rules-001', '/uploads/rules.pdf', 'rules.pdf', 1024000, 1, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z'),
  ('d-002', '出張申請書', 'f-tmpl-001', '/uploads/travel-request.xlsx', 'travel-request.xlsx', 51200, 1, 'u-admin-001', '2026-03-08T09:23:21.145Z', '2026-03-08T09:23:21.145Z');

