import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

interface Document {
  id: string;
  title: string;
  filename: string;
  fileUrl: string;
  folderId: string | null;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function DocumentsPage() {
  const { isAdmin } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folderPath, setFolderPath] = useState<Folder[]>([]);

  const loadData = () => {
    const params = new URLSearchParams();
    if (currentFolder) params.set("folderId", currentFolder);
    if (search) params.set("search", search);

    api<{ data: Folder[] }>(`/documents/folders?parentId=${currentFolder || ""}`).then((res) => setFolders(res.data));
    api<{ data: Document[] }>(`/documents?${params.toString()}`).then((res) => setDocuments(res.data));
  };

  useEffect(() => {
    loadData();
  }, [currentFolder, search]);

  const navigateToFolder = (folder: Folder | null) => {
    if (folder) {
      setCurrentFolder(folder.id);
      setFolderPath((prev) => [...prev, folder]);
    } else {
      setCurrentFolder(null);
      setFolderPath([]);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      setCurrentFolder(folderPath[index].id);
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>ドキュメント</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="ファイル名・タイトルで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16, fontSize: 14 }}>
        <button
          onClick={() => navigateToBreadcrumb(-1)}
          style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 0 }}
        >
          ルート
        </button>
        {folderPath.map((f, i) => (
          <span key={f.id}>
            <span style={{ color: "#94a3b8" }}> / </span>
            <button
              onClick={() => navigateToBreadcrumb(i)}
              style={{ background: "none", border: "none", color: i === folderPath.length - 1 ? "#1e293b" : "#3b82f6", cursor: "pointer", padding: 0 }}
            >
              {f.name}
            </button>
          </span>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {folders.length === 0 && documents.length === 0 && (
          <p style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>アイテムはありません</p>
        )}

        {folders.map((f) => (
          <div
            key={f.id}
            onClick={() => navigateToFolder(f)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
          >
            <span style={{ fontSize: 20 }}>&#128193;</span>
            <span>{f.name}</span>
          </div>
        ))}

        {documents.map((doc) => (
          <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 20 }}>&#128196;</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{doc.title}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {doc.filename} | v{doc.currentVersion} | {new Date(doc.updatedAt).toLocaleDateString("ja-JP")}
              </div>
            </div>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: 14 }}>ダウンロード</a>
          </div>
        ))}
      </div>
    </div>
  );
}
