import { Link } from "react-router-dom";
import { useApiQuery } from "../lib/api/use-api-query";
import { useAuth } from "../hooks/useAuth";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data: announcementsData } = useApiQuery<{ data: Announcement[]; total: number }>({
    queryKey: ["dashboard", "announcements"],
    url: "/announcements",
    params: { page: 1 },
  });

  const { data: unreadData } = useApiQuery<{ count: number }>({
    queryKey: ["announcements", "unread-count"],
    url: "/announcements/unread-count",
  });

  const announcements = announcementsData?.data.slice(0, 5) ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "おはようございます" : hour < 17 ? "お疲れ様です" : "お疲れ様でした";

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle" style={{ marginBottom: 4 }}>{greeting}</p>
        <h1 className="page-title">{user?.name} さん</h1>
      </div>

      <div className="grid-3 animate-in stagger-1" style={{ marginBottom: 32 }}>
        <div className="card stat-card" style={{ color: unreadCount > 0 ? "var(--c-accent)" : "var(--c-success)" }}>
          <div className="stat-label">未読お知らせ</div>
          <div className="stat-value">{unreadCount}</div>
          <Link to="/announcements" style={{ fontSize: "var(--fs-xs)", color: "var(--c-info)", marginTop: 8, display: "inline-block" }}>
            一覧を見る →
          </Link>
        </div>

        <Link to="/schedule" className="card stat-card" style={{ color: "var(--c-info)", textDecoration: "none" }}>
          <div className="stat-label">スケジュール</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: 700, marginTop: 8 }}>
            {now.getMonth() + 1}月{now.getDate()}日
          </div>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", marginTop: 4 }}>
            カレンダーを確認 →
          </div>
        </Link>

        <Link to="/links" className="card stat-card" style={{ color: "var(--c-primary)", textDecoration: "none" }}>
          <div className="stat-label">リンク集</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: 700, marginTop: 8 }}>
            Quick Access
          </div>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", marginTop: 4 }}>
            業務ツールへ →
          </div>
        </Link>
      </div>

      <div className="card animate-in stagger-2">
        <div style={{ padding: "var(--sp-5) var(--sp-6)", borderBottom: "1px solid var(--c-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: 700 }}>最新のお知らせ</h2>
          <Link to="/announcements" style={{ fontSize: "var(--fs-xs)", color: "var(--c-info)" }}>すべて見る →</Link>
        </div>
        {announcements.length === 0 ? (
          <div className="empty-state">お知らせはありません</div>
        ) : (
          <div>
            {announcements.map((a) => (
              <Link key={a.id} to={`/announcements/${a.id}`} className="announcement-item">
                <span className="badge badge-default" style={{ marginRight: 12 }}>{a.category}</span>
                <span style={{ flex: 1 }}>{a.title}</span>
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-faint)", fontFamily: "var(--font-display)" }}>
                  {new Date(a.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
