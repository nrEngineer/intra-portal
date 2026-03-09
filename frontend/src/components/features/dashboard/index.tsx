import { Link } from "react-router-dom";
import { useApiQuery } from "../../../lib/api/use-api-query";
import { useAuth } from "../../../hooks/useAuth";
import { useGreeting } from "./hooks";
import { StatCard } from "./components/StatCard";
import { RecentAnnouncements } from "./components/RecentAnnouncements";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export function DashboardContainer() {
  const { user } = useAuth();
  const greeting = useGreeting();

  const { data: announcementsData } = useApiQuery<{
    data: Announcement[];
    total: number;
  }>({
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

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle" style={{ marginBottom: 4 }}>
          {greeting}
        </p>
        <h1 className="page-title">{user?.name} さん</h1>
      </div>

      <div className="grid-3 animate-in stagger-1" style={{ marginBottom: 32 }}>
        <StatCard
          label="未読お知らせ"
          color={unreadCount > 0 ? "var(--c-accent)" : "var(--c-success)"}
        >
          <div className="stat-value">{unreadCount}</div>
          <Link
            to="/announcements"
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--c-info)",
              marginTop: 8,
              display: "inline-block",
            }}
          >
            一覧を見る →
          </Link>
        </StatCard>

        <StatCard label="スケジュール" color="var(--c-info)" to="/schedule">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-lg)",
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            {now.getMonth() + 1}月{now.getDate()}日
          </div>
          <div
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--c-text-muted)",
              marginTop: 4,
            }}
          >
            カレンダーを確認 →
          </div>
        </StatCard>

        <StatCard label="リンク集" color="var(--c-primary)" to="/links">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-lg)",
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            Quick Access
          </div>
          <div
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--c-text-muted)",
              marginTop: 4,
            }}
          >
            業務ツールへ →
          </div>
        </StatCard>
      </div>

      <RecentAnnouncements announcements={announcements} />
    </div>
  );
}
