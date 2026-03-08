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
      <div className="page-header flex items-center justify-between">
        <h1 className="page-title">お知らせ</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            新規お知らせ
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="form-panel animate-in stagger-1">
          <h3>{editingId ? "お知らせ編集" : "新規お知らせ"}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">タイトル</label>
                <input
                  type="text"
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">本文</label>
                <textarea
                  className="input"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                  rows={6}
                />
              </div>
              <div>
                <label className="label">カテゴリ</label>
                <select
                  className="select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ステータス</label>
                <select
                  className="select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="published">公開</option>
                  <option value="draft">下書き</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  />
                  ピン留め
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "更新" : "作成"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="toolbar animate-in stagger-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ search, page: "1" })}
        />
        <select
          className="select"
          style={{ width: "auto" }}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateParams({ category: e.target.value, page: "1" });
          }}
        >
          <option value="">全カテゴリ</option>
          <option value="general">一般</option>
          <option value="hr">人事</option>
          <option value="it">IT</option>
          <option value="event">イベント</option>
        </select>
        <button className="btn btn-primary" onClick={() => updateParams({ search, page: "1" })}>
          検索
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state animate-in stagger-3">お知らせはありません</div>
      ) : (
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
                    onClick={(e) => startEdit(a, e)}
                  >
                    編集
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => handleDelete(a, e)}
                  >
                    削除
                  </button>
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination animate-in stagger-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn${p === page ? " active" : ""}`}
              onClick={() => updateParams({ page: String(p) })}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
