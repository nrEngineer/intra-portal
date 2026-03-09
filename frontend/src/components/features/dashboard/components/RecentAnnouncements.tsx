import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

interface RecentAnnouncementsProps {
  announcements: Announcement[];
}

export function RecentAnnouncements({ announcements }: RecentAnnouncementsProps) {
  return (
    <div className="card animate-in stagger-2">
      <div
        style={{
          padding: "var(--sp-5) var(--sp-6)",
          borderBottom: "1px solid var(--c-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-md)",
            fontWeight: 700,
          }}
        >
          最新のお知らせ
        </h2>
        <Link
          to="/announcements"
          style={{ fontSize: "var(--fs-xs)", color: "var(--c-info)" }}
        >
          すべて見る →
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">お知らせはありません</div>
      ) : (
        <div>
          {announcements.map((a) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className="announcement-item"
            >
              <span
                className="badge badge-default"
                style={{ marginRight: 12 }}
              >
                {a.category}
              </span>
              <span style={{ flex: 1 }}>{a.title}</span>
              <span
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--c-text-faint)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {new Date(a.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
