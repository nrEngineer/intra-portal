import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface AnnouncementDetail {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isPinned: boolean;
  attachments: { filename: string; url: string; size: number }[];
}

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api<AnnouncementDetail>(`/announcements/${id}`)
      .then(setAnnouncement)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div>
        <Link to="/announcements" style={{ color: "#3b82f6", marginBottom: 16, display: "inline-block" }}>&larr; お知らせ一覧に戻る</Link>
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  if (!announcement) {
    return <p style={{ color: "#94a3b8" }}>読み込み中...</p>;
  }

  return (
    <div>
      <Link to="/announcements" style={{ color: "#3b82f6", marginBottom: 16, display: "inline-block" }}>&larr; お知らせ一覧に戻る</Link>

      <div style={{ background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{announcement.category}</span>
          {announcement.isPinned && <span style={{ fontSize: 12, color: "#f59e0b" }}>&#x1F4CC; ピン留め</span>}
        </div>

        <h1 style={{ fontSize: 24, marginBottom: 8 }}>{announcement.title}</h1>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>
          <span>投稿者: {announcement.author}</span>
          <span style={{ marginLeft: 16 }}>作成: {new Date(announcement.createdAt).toLocaleDateString("ja-JP")}</span>
          {announcement.updatedAt !== announcement.createdAt && (
            <span style={{ marginLeft: 16 }}>更新: {new Date(announcement.updatedAt).toLocaleDateString("ja-JP")}</span>
          )}
        </div>

        <div style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{announcement.body}</div>

        {announcement.attachments.length > 0 && (
          <div style={{ marginTop: 24, padding: 16, background: "#f8fafc", borderRadius: 4 }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>添付ファイル</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {announcement.attachments.map((att, i) => (
                <li key={i} style={{ padding: "4px 0" }}>
                  <a href={att.url} style={{ color: "#3b82f6" }}>{att.filename}</a>
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>({(att.size / 1024).toFixed(1)} KB)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
