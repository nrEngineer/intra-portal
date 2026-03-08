import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  isPinned: boolean;
}

export function AnnouncementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    api<{ data: Announcement[]; total: number; page: number; limit: number }>(
      `/announcements?${params.toString()}`
    ).then((res) => {
      setAnnouncements(res.data);
      setTotal(res.total);
    });
  }, [page, search, category]);

  const totalPages = Math.ceil(total / 10);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    setSearchParams(params);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>お知らせ</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ search, page: "1" })}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1 }}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateParams({ category: e.target.value, page: "1" });
          }}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
        >
          <option value="">全カテゴリ</option>
          <option value="general">一般</option>
          <option value="hr">人事</option>
          <option value="it">IT</option>
          <option value="event">イベント</option>
        </select>
        <button
          onClick={() => updateParams({ search, page: "1" })}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          検索
        </button>
      </div>

      {announcements.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>お知らせはありません</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {announcements.map((a) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              style={{ display: "block", padding: 16, borderBottom: "1px solid #f1f5f9", textDecoration: "none", color: "#1e293b" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {a.isPinned && <span style={{ color: "#f59e0b", fontSize: 12 }}>&#x1F4CC;</span>}
                <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{a.category}</span>
                <span style={{ flex: 1 }}>{a.title}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(a.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParams({ page: String(p) })}
              style={{
                padding: "4px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                background: p === page ? "#3b82f6" : "#fff",
                color: p === page ? "#fff" : "#1e293b",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
