import { Link } from "react-router-dom";
import type { Announcement } from "../../../../types/announcement";

interface AnnouncementListProps {
  announcements: Announcement[];
  isAdmin: boolean;
  onEdit: (a: Announcement, e: React.MouseEvent) => void;
  onDelete: (a: { id: number; title: string }, e: React.MouseEvent) => void;
}

export function AnnouncementList({
  announcements,
  isAdmin,
  onEdit,
  onDelete,
}: AnnouncementListProps) {
  return (
    <div className="card animate-in stagger-3">
      {announcements.map((a) => (
        <Link key={a.id} to={`/announcements/${a.id}`} className="announcement-item">
          {a.isPinned && (
            <span style={{ marginRight: "var(--sp-2)", fontSize: "var(--fs-xs)" }}>📌</span>
          )}
          <span className="badge badge-default" style={{ marginRight: "var(--sp-3)" }}>
            {a.category}
          </span>
          <span className="flex-1">{a.title}</span>
          <span className="text-xs text-muted" style={{ marginRight: "var(--sp-3)" }}>
            {new Date(a.createdAt).toLocaleDateString("ja-JP")}
          </span>
          {isAdmin && (
            <span className="flex gap-2">
              <button
                className="btn btn-sm btn-warn"
                onClick={(e) => onEdit(a, e)}
              >
                編集
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={(e) => onDelete(a, e)}
              >
                削除
              </button>
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
