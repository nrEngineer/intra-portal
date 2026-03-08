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

const editBtnStyle: React.CSSProperties = {
  padding: "4px 8px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  marginRight: 4,
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

const createBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export function DocumentsPage() {
  const { isAdmin } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folderPath, setFolderPath] = useState<Folder[]>([]);

  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({ title: "", fileUrl: "", fileName: "", fileSize: 0 });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  // Folder handlers
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api("/documents/folders", { method: "POST", body: { name: newFolderName, parentId: currentFolder } });
      setNewFolderName("");
      setShowFolderInput(false);
      setError("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "フォルダの作成に失敗しました");
    }
  };

  const handleRenameFolder = async (f: Folder) => {
    const name = prompt("新しいフォルダ名", f.name);
    if (!name || name === f.name) return;
    try {
      await api(`/documents/folders/${f.id}`, { method: "PUT", body: { name } });
      setError("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "名前変更に失敗しました");
    }
  };

  const handleDeleteFolder = async (f: Folder) => {
    if (!confirm(`フォルダ「${f.name}」を削除しますか？`)) return;
    try {
      await api(`/documents/folders/${f.id}`, { method: "DELETE" });
      setError("");
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  // Document handlers
  const handleCreateDoc = async () => {
    if (!docForm.title.trim()) return;
    try {
      await api("/documents", {
        method: "POST",
        body: { title: docForm.title, fileUrl: docForm.fileUrl, fileName: docForm.fileName, fileSize: docForm.fileSize, folderId: currentFolder },
      });
      setDocForm({ title: "", fileUrl: "", fileName: "", fileSize: 0 });
      setShowDocForm(false);
      setError("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ドキュメントの作成に失敗しました");
    }
  };

  const startEditDoc = (doc: Document) => {
    setEditingDocId(doc.id);
    setDocForm({ title: doc.title, fileUrl: doc.fileUrl, fileName: doc.filename, fileSize: 0 });
    setShowDocForm(true);
  };

  const handleEditDoc = async () => {
    if (!editingDocId || !docForm.title.trim()) return;
    try {
      await api(`/documents/${editingDocId}`, {
        method: "PUT",
        body: { title: docForm.title, fileUrl: docForm.fileUrl, fileName: docForm.fileName, fileSize: docForm.fileSize },
      });
      setDocForm({ title: "", fileUrl: "", fileName: "", fileSize: 0 });
      setEditingDocId(null);
      setShowDocForm(false);
      setError("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ドキュメントの更新に失敗しました");
    }
  };

  const handleDeleteDoc = async (doc: Document) => {
    if (!confirm(`ドキュメント「${doc.title}」を削除しますか？`)) return;
    try {
      await api(`/documents/${doc.id}`, { method: "DELETE" });
      setError("");
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const cancelDocForm = () => {
    setShowDocForm(false);
    setEditingDocId(null);
    setDocForm({ title: "", fileUrl: "", fileName: "", fileSize: 0 });
  };

  // isAdmin is available for future use
  void isAdmin;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>ドキュメント</h1>

      {error && (
        <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 4, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="ファイル名・タイトルで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1, minWidth: 200 }}
        />
        <button onClick={() => { setShowFolderInput((v) => !v); setNewFolderName(""); }} style={createBtnStyle}>
          新規フォルダ
        </button>
        <button onClick={() => { setShowDocForm((v) => !v); setEditingDocId(null); setDocForm({ title: "", fileUrl: "", fileName: "", fileSize: 0 }); }} style={createBtnStyle}>
          新規ドキュメント
        </button>
      </div>

      {showFolderInput && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <input
            type="text"
            placeholder="フォルダ名"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1 }}
            autoFocus
          />
          <button onClick={handleCreateFolder} style={createBtnStyle}>作成</button>
          <button onClick={() => setShowFolderInput(false)} style={{ ...createBtnStyle, background: "#6b7280" }}>キャンセル</button>
        </div>
      )}

      {showDocForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>{editingDocId ? "ドキュメント編集" : "新規ドキュメント"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              placeholder="タイトル"
              value={docForm.title}
              onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
              style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
            />
            <input
              type="text"
              placeholder="ファイルURL（例: https://storage.example.com/file.pdf）"
              value={docForm.fileUrl}
              onChange={(e) => setDocForm((f) => ({ ...f, fileUrl: e.target.value }))}
              style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
            />
            <input
              type="text"
              placeholder="ファイル名（例: document.pdf）"
              value={docForm.fileName}
              onChange={(e) => setDocForm((f) => ({ ...f, fileName: e.target.value }))}
              style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
            />
            <input
              type="number"
              placeholder="ファイルサイズ（バイト）"
              value={docForm.fileSize || ""}
              onChange={(e) => setDocForm((f) => ({ ...f, fileSize: Number(e.target.value) }))}
              style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={editingDocId ? handleEditDoc : handleCreateDoc} style={createBtnStyle}>
                {editingDocId ? "更新" : "作成"}
              </button>
              <button onClick={cancelDocForm} style={{ ...createBtnStyle, background: "#6b7280" }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

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
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => navigateToFolder(f)}>&#128193;</span>
            <span style={{ flex: 1, cursor: "pointer" }} onClick={() => navigateToFolder(f)}>{f.name}</span>
            <button onClick={() => handleRenameFolder(f)} style={editBtnStyle}>名前変更</button>
            <button onClick={() => handleDeleteFolder(f)} style={deleteBtnStyle}>削除</button>
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
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: 14, marginRight: 8 }}>ダウンロード</a>
            <button onClick={() => startEditDoc(doc)} style={editBtnStyle}>編集</button>
            <button onClick={() => handleDeleteDoc(doc)} style={deleteBtnStyle}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
