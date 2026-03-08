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
      <div className="page-header">
        <h1 className="page-title">ドキュメント</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          className="input"
          style={{ flex: 1, minWidth: 200 }}
          type="text"
          placeholder="ファイル名・タイトルで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowFolderInput((v) => !v);
            setNewFolderName("");
          }}
        >
          新規フォルダ
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowDocForm((v) => !v);
            setEditingDocId(null);
            setDocForm({ title: "", fileUrl: "", fileName: "", fileSize: 0 });
          }}
        >
          新規ドキュメント
        </button>
      </div>

      {showFolderInput && (
        <div className="toolbar mb-4">
          <input
            className="input"
            style={{ flex: 1 }}
            type="text"
            placeholder="フォルダ名"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleCreateFolder}>作成</button>
          <button className="btn btn-ghost" onClick={() => setShowFolderInput(false)}>キャンセル</button>
        </div>
      )}

      {showDocForm && (
        <div className="form-panel">
          <h3>{editingDocId ? "ドキュメント編集" : "新規ドキュメント"}</h3>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <label className="label">タイトル</label>
              <input
                className="input"
                type="text"
                placeholder="タイトル"
                value={docForm.title}
                onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">ファイルURL</label>
              <input
                className="input"
                type="text"
                placeholder="ファイルURL（例: https://storage.example.com/file.pdf）"
                value={docForm.fileUrl}
                onChange={(e) => setDocForm((f) => ({ ...f, fileUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">ファイル名</label>
              <input
                className="input"
                type="text"
                placeholder="ファイル名（例: document.pdf）"
                value={docForm.fileName}
                onChange={(e) => setDocForm((f) => ({ ...f, fileName: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">ファイルサイズ（バイト）</label>
              <input
                className="input"
                type="number"
                placeholder="ファイルサイズ（バイト）"
                value={docForm.fileSize || ""}
                onChange={(e) => setDocForm((f) => ({ ...f, fileSize: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={editingDocId ? handleEditDoc : handleCreateDoc}>
              {editingDocId ? "更新" : "作成"}
            </button>
            <button className="btn btn-ghost" onClick={cancelDocForm}>キャンセル</button>
          </div>
        </div>
      )}

      <div className="breadcrumb">
        <button onClick={() => navigateToBreadcrumb(-1)}>ルート</button>
        {folderPath.map((f, i) => (
          <span key={f.id} className="flex items-center">
            <span className="separator">/</span>
            {i === folderPath.length - 1 ? (
              <span className="current">{f.name}</span>
            ) : (
              <button onClick={() => navigateToBreadcrumb(i)}>{f.name}</button>
            )}
          </span>
        ))}
      </div>

      <div className="card">
        {folders.length === 0 && documents.length === 0 && (
          <div className="empty-state">アイテムはありません</div>
        )}

        {folders.map((f, idx) => (
          <div key={f.id} className={`file-item animate-in stagger-${Math.min(idx + 1, 6)}`}>
            <div
              className="file-icon folder"
              style={{ cursor: "pointer" }}
              onClick={() => navigateToFolder(f)}
            >
              📁
            </div>
            <span
              className="flex-1"
              style={{ cursor: "pointer" }}
              onClick={() => navigateToFolder(f)}
            >
              {f.name}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-warn" onClick={() => handleRenameFolder(f)}>名前変更</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFolder(f)}>削除</button>
            </div>
          </div>
        ))}

        {documents.map((doc, idx) => (
          <div key={doc.id} className={`file-item animate-in stagger-${Math.min(folders.length + idx + 1, 6)}`}>
            <div className="file-icon doc">📄</div>
            <div className="flex-1">
              <div style={{ fontWeight: 500 }}>{doc.title}</div>
              <div className="text-xs text-muted">
                {doc.filename} | v{doc.currentVersion} | {new Date(doc.updatedAt).toLocaleDateString("ja-JP")}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
              >
                ダウンロード
              </a>
              <button className="btn btn-sm btn-warn" onClick={() => startEditDoc(doc)}>編集</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDoc(doc)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
