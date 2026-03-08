import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Announcement {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  isPinned: boolean;
}

const CATEGORIES = ["全社", "総務", "IT", "人事", "イベント"];

export function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const page = Number(searchParams.get("page") || "1");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "全社", status: "published", pinned: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadAnnouncements = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api<{ data: Announcement[]; total: number }>(`/announcements?${params.toString()}`).then((res) => {
      setAnnouncements(res.data);
      setTotal(res.total);
    });
  };

  useEffect(() => {
    loadAnnouncements();
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

  const openCreate = () => {
    setForm({ title: "", body: "", category: "全社", status: "published", pinned: false });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const startEdit = async (a: Announcement, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const detail = await api<{ title: string; body: string; category: string; status: string; isPinned: boolean }>(`/announcements/${a.id}`);
      setForm({ title: detail.title, body: detail.body, category: detail.category, status: detail.status || "published", pinned: detail.isPinned });
      setEditingId(a.id);
      setError("");
      setShowForm(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "取得に失敗しました");
    }
  };

  const handleDelete = async (a: Announcement, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`「${a.title}」を削除しますか？`)) return;
    try {
      await api(`/announcements/${a.id}`, { method: "DELETE" });
      loadAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        title: form.title,
        body: form.body,
        category: form.category,
        status: form.status,
        pinned: form.pinned,
      };
      if (editingId) {
        await api(`/announcements/${editingId}`, { method: "PUT", body });
      } else {
        await api("/announcements", { method: "POST", body });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: "", body: "", category: "全社", status: "published", pinned: false });
      loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
    setForm({ title: "", body: "", category: "全社", status: "published", pinned: false });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>お知らせ</h1>
        {isAdmin && (
          <button
            onClick={openCreate}
            style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            新規お知らせ
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>{editingId ? "お知らせ編集" : "新規お知らせ"}</h2>
          {error && <p style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 }}>タイトル</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 }}>本文</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                rows={6}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 }}>カテゴリ</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 600, fontSize: 14 }}>ステータス</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
                >
                  <option value="published">公開</option>
                  <option value="draft">下書き</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                />
                ピン留め
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{ padding: "8px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                {editingId ? "更新" : "作成"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{ padding: "8px 16px", background: "#fff", color: "#64748b", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

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
                {isAdmin && (
                  <span style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={(e) => startEdit(a, e)}
                      style={{ padding: "4px 8px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, marginRight: 4 }}
                    >
                      編集
                    </button>
                    <button
                      onClick={(e) => handleDelete(a, e)}
                      style={{ padding: "4px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                    >
                      削除
                    </button>
                  </span>
                )}
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
