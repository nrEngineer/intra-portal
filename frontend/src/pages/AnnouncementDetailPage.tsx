import { useParams, Link } from "react-router-dom";
import { useAnnouncement } from "../hooks/useAnnouncements";

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const announcementId = Number(id);
  const { data: announcement, isLoading, error } = useAnnouncement(announcementId);

  if (isLoading) {
    return <p className="text-muted text-sm">読み込み中...</p>;
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="breadcrumb">
          <Link to="/announcements" className="text-sm" style={{ color: "var(--c-info)" }}>
            &larr; お知らせ一覧に戻る
          </Link>
        </div>
        <div className="alert alert-error">{error.message}</div>
      </div>
    );
  }

  if (!announcement) {
    return <p className="text-muted text-sm">読み込み中...</p>;
  }

  return (
    <div className="animate-in">
      <div className="breadcrumb">
        <Link to="/announcements" style={{ color: "var(--c-info)", background: "none", border: "none", fontFamily: "var(--font-body)", fontSize: "var(--fs-sm)", cursor: "pointer", padding: 0 }}>
          &larr; お知らせ一覧
        </Link>
        <span className="separator">/</span>
        <span className="current">{announcement.title}</span>
      </div>

      <div className="card card-body stagger-1">
        <div className="flex items-center gap-3 mb-4">
          <span className="badge badge-default">{announcement.category}</span>
          {announcement.isPinned && (
            <span className="text-xs" style={{ color: "var(--c-warning)" }}>
              📌 ピン留め
            </span>
          )}
        </div>

        <h1
          className="page-title"
          style={{ marginBottom: "var(--sp-3)", lineHeight: "var(--lh-tight)" }}
        >
          {announcement.title}
        </h1>

        <div className="flex gap-4 text-xs text-muted mb-6">
          <span>投稿者: {announcement.authorName}</span>
          <span>作成: {new Date(announcement.createdAt).toLocaleDateString("ja-JP")}</span>
          {announcement.updatedAt !== announcement.createdAt && (
            <span>更新: {new Date(announcement.updatedAt).toLocaleDateString("ja-JP")}</span>
          )}
        </div>

        <div
          className="text-sm"
          style={{
            lineHeight: "var(--lh-relaxed)",
            whiteSpace: "pre-wrap",
            color: "var(--c-text)",
          }}
        >
          {announcement.content}
        </div>

        {announcement.attachments.length > 0 && (
          <div
            className="mt-6"
            style={{
              padding: "var(--sp-5)",
              background: "var(--c-bg-warm)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--c-border-light)",
            }}
          >
            <p
              className="text-xs"
              style={{
                fontWeight: "var(--fw-bold)",
                color: "var(--c-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "var(--font-display)",
                marginBottom: "var(--sp-3)",
              }}
            >
              添付ファイル
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {announcement.attachments.map((att, i) => (
                <li
                  key={i}
                  className="file-item"
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <span className="file-icon doc">📄</span>
                  <div className="flex-1">
                    <a
                      href={att.filePath}
                      className="text-sm"
                      style={{ color: "var(--c-info)", fontWeight: "var(--fw-medium)" }}
                    >
                      {att.fileName}
                    </a>
                    <p className="text-xs text-muted" style={{ marginTop: "var(--sp-1)" }}>
                      {(att.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
