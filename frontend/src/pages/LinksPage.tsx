import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface InternalLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  sortOrder: number;
}

export function LinksPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "editor";

  const [links, setLinks] = useState<InternalLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "", category: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadLinks = () => {
    const params = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : "";
    api<{ data: InternalLink[] }>(`/links${params}`).then((res) => setLinks(res.data));
  };

  const loadCategories = () => {
    api<{ data: string[] }>("/links/categories").then((res) => setCategories(res.data));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadLinks();
  }, [selectedCategory]);

  const groupedLinks = links.reduce<Record<string, InternalLink[]>>((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  const resetForm = () => {
    setForm({ title: "", url: "", description: "", category: "", sortOrder: 0 });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (link: InternalLink) => {
    setForm({
      title: link.title,
      url: link.url,
      description: link.description ?? "",
      category: link.category,
      sortOrder: link.sortOrder,
    });
    setEditingId(link.id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api(`/links/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/links", { method: "POST", body: JSON.stringify(form) });
      }
      resetForm();
      loadLinks();
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  const handleDelete = async (link: InternalLink) => {
    if (!confirm(`「${link.title}」を削除しますか？`)) return;
    try {
      await api(`/links/${link.id}`, { method: "DELETE" });
      loadLinks();
      loadCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <h1 className="page-title">リンク集</h1>
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm((prev) => !prev);
            }}
          >
            {showForm && !editingId ? "キャンセル" : "新規リンク"}
          </button>
        )}
      </div>

      {canEdit && showForm && (
        <form className="form-panel" onSubmit={handleSubmit}>
          <h3>{editingId ? "リンクを編集" : "新規リンクを追加"}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div>
              <label className="label">タイトル *</label>
              <input
                className="input"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">URL *</label>
              <input
                className="input"
                type="text"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <label className="label">カテゴリ *</label>
              <input
                className="input"
                type="text"
                required
                list="category-list"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">表示順</label>
              <input
                className="input"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">説明</label>
              <input
                className="input"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "更新" : "追加"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div className="pill-filter mb-6">
        <button
          className={`pill${!selectedCategory ? " active" : ""}`}
          onClick={() => setSelectedCategory("")}
        >
          すべて
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`pill${selectedCategory === c ? " active" : ""}`}
            onClick={() => setSelectedCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {Object.entries(groupedLinks).map(([cat, items], groupIdx) => (
        <div key={cat} className="mb-6">
          <h2 className="section-title">{cat}</h2>
          <div className="grid-auto">
            {items.map((link, idx) => (
              <div
                key={link.id}
                className="animate-in"
                style={{ animationDelay: `${(groupIdx * items.length + idx) * 60}ms`, position: "relative" }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                  style={canEdit ? { paddingRight: "calc(var(--sp-6) + 80px)" } : undefined}
                >
                  <div className="link-card-title">{link.title}</div>
                  {link.description && (
                    <div className="link-card-desc">{link.description}</div>
                  )}
                </a>
                {canEdit && (
                  <div
                    style={{ position: "absolute", top: "var(--sp-3)", right: "var(--sp-3)", display: "flex", gap: "var(--sp-1)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-sm btn-warn"
                      onClick={(e) => {
                        e.preventDefault();
                        startEdit(link);
                      }}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(link);
                      }}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {links.length === 0 && (
        <div className="empty-state">リンクはありません</div>
      )}
    </div>
  );
}
