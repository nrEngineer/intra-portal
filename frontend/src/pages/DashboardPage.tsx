import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api<{ data: Announcement[] }>("/announcements?page=1").then((res) => setAnnouncements(res.data.slice(0, 5)));
    api<{ count: number }>("/announcements/unread-count").then((res) => setUnreadCount(res.count));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>ダッシュボード</h1>
      <p style={{ marginBottom: 24, color: "#64748b" }}>ようこそ、{user?.name} さん</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>未読お知らせ</h3>
          <p style={{ fontSize: 32, fontWeight: "bold", color: unreadCount > 0 ? "#ef4444" : "#10b981" }}>{unreadCount}</p>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>クイックリンク</h3>
          <Link to="/announcements" style={{ color: "#3b82f6", fontSize: 14 }}>お知らせ一覧</Link>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>クイックリンク</h3>
          <Link to="/schedule" style={{ color: "#3b82f6", fontSize: 14 }}>スケジュール</Link>
        </div>
      </div>

      <div style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>最新のお知らせ</h2>
        {announcements.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>お知らせはありません</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {announcements.map((a) => (
              <li key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <Link to={`/announcements/${a.id}`} style={{ color: "#1e293b", textDecoration: "none" }}>
                  <span style={{ fontSize: 12, color: "#64748b", marginRight: 8 }}>[{a.category}]</span>
                  {a.title}
                </Link>
                <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>{new Date(a.createdAt).toLocaleDateString("ja-JP")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
