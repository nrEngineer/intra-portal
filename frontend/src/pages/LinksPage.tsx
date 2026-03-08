import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface InternalLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  sortOrder: number;
}

export function LinksPage() {
  const [links, setLinks] = useState<InternalLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    api<{ data: string[] }>("/links/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const params = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : "";
    api<{ data: InternalLink[] }>(`/links${params}`).then((res) => setLinks(res.data));
  }, [selectedCategory]);

  const groupedLinks = links.reduce<Record<string, InternalLink[]>>((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>リンク集</h1>

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
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: 16,
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
            ))}
          </div>
        </div>
      ))}

      {links.length === 0 && <p style={{ color: "#94a3b8" }}>リンクはありません</p>}
    </div>
  );
}
