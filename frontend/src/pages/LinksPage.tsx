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

const primaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "8px 24px",
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};

const editBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#374151",
  marginBottom: 4,
};

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>リンク集</h1>
        {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowForm((prev) => !prev);
            }}
            style={primaryBtnStyle}
          >
            {showForm && !editingId ? "キャンセル" : "新規リンク"}
          </button>
        )}
      </div>

      {canEdit && showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
            {editingId ? "リンクを編集" : "新規リンクを追加"}
          </h2>
          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>タイトル *</label>
              <input
                style={inputStyle}
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>URL *</label>
              <input
                style={inputStyle}
                type="text"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>カテゴリ *</label>
              <input
                style={inputStyle}
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
              <label style={labelStyle}>表示順</label>
              <input
                style={inputStyle}
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>説明</label>
              <input
                style={inputStyle}
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="submit" style={submitBtnStyle}>
              {editingId ? "更新" : "追加"}
            </button>
            <button type="button" onClick={resetForm} style={{ ...primaryBtnStyle, background: "#6b7280" }}>
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedCategory("")}
          style={{
            padding: "6px 16px",
            border: "1px solid #d1d5db",
            borderRadius: 20,
            background: !selectedCategory ? "#3b82f6" : "#fff",
            color: !selectedCategory ? "#fff" : "#1e293b",
            cursor: "pointer",
          }}
        >
          すべて
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{
              padding: "6px 16px",
              border: "1px solid #d1d5db",
              borderRadius: 20,
              background: selectedCategory === c ? "#3b82f6" : "#fff",
              color: selectedCategory === c ? "#fff" : "#1e293b",
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {Object.entries(groupedLinks).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, color: "#64748b", marginBottom: 12 }}>{cat}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {items.map((link) => (
              <div key={link.id} style={{ position: "relative" }}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    padding: 16,
                    paddingRight: canEdit ? 80 : 16,
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    textDecoration: "none",
                    color: "#1e293b",
                  }}
                >
                  <h3 style={{ fontSize: 14, color: "#3b82f6", marginBottom: 4 }}>{link.title}</h3>
                  {link.description && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{link.description}</p>}
                </a>
                {canEdit && (
                  <div
                    style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        startEdit(link);
                      }}
                      style={editBtnStyle}
                    >
                      編集
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(link);
                      }}
                      style={deleteBtnStyle}
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

      {links.length === 0 && <p style={{ color: "#94a3b8" }}>リンクはありません</p>}
    </div>
  );
}
