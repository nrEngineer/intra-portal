import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useFolders,
  useDocuments,
  useFolderCreate,
  useFolderUpdate,
  useFolderDelete,
  useDocumentCreate,
  useDocumentUpdate,
  useDocumentDelete,
} from "../hooks/useDocuments";
import type { Folder, Document } from "../types/document";

export function DocumentsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "editor";
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [folderPath, setFolderPath] = useState<Folder[]>([]);

  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({ title: "", content: "" });
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: folders = [] } = useFolders(currentFolder);
  const { data: documents = [], isLoading } = useDocuments({
    folderId: currentFolder ?? undefined,
    search: search || undefined,
  });

  const createFolder = useFolderCreate();
  const updateFolder = useFolderUpdate();
  const deleteFolder = useFolderDelete();
  const createDoc = useDocumentCreate();
  const updateDoc = useDocumentUpdate();
  const deleteDoc = useDocumentDelete();

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
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder.mutate(
      { name: newFolderName, parentId: currentFolder ?? undefined },
      {
        onSuccess: () => {
          setNewFolderName("");
          setShowFolderInput(false);
          setError("");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "フォルダの作成に失敗しました");
        },
      }
    );
  };

  const handleRenameFolder = (f: Folder) => {
    const name = prompt("新しいフォルダ名", f.name);
    if (!name || name === f.name) return;
    updateFolder.mutate(
      { id: f.id, name },
      {
        onSuccess: () => {
          setError("");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "名前変更に失敗しました");
        },
      }
    );
  };

  const handleDeleteFolder = (f: Folder) => {
    if (!confirm(`フォルダ「${f.name}」を削除しますか？`)) return;
    deleteFolder.mutate(f.id, {
      onSuccess: () => {
        setError("");
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : "削除に失敗しました");
      },
    });
  };

  // Document handlers
  const handleDocSubmit = () => {
    if (!docForm.title.trim()) return;
    if (editingDocId) {
      updateDoc.mutate(
        { id: editingDocId, title: docForm.title, content: docForm.content },
        {
          onSuccess: () => {
            setDocForm({ title: "", content: "" });
            setEditingDocId(null);
            setShowDocForm(false);
            setError("");
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "ドキュメントの更新に失敗しました");
          },
        }
      );
    } else {
      createDoc.mutate(
        { title: docForm.title, content: docForm.content, folderId: currentFolder ?? undefined },
        {
          onSuccess: () => {
            setDocForm({ title: "", content: "" });
            setShowDocForm(false);
            setError("");
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "ドキュメントの作成に失敗しました");
          },
        }
      );
    }
  };

  const startEditDoc = (doc: Document) => {
    setEditingDocId(doc.id);
    setDocForm({ title: doc.title, content: doc.content });
    setShowDocForm(true);
  };

  const handleDeleteDoc = (doc: Document) => {
    if (!confirm(`ドキュメント「${doc.title}」を削除しますか？`)) return;
    deleteDoc.mutate(doc.id, {
      onSuccess: () => {
        setError("");
      },
      onError: (err) => {
        alert(err instanceof Error ? err.message : "削除に失敗しました");
      },
    });
  };

  const cancelDocForm = () => {
    setShowDocForm(false);
    setEditingDocId(null);
    setDocForm({ title: "", content: "" });
  };

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
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowFolderInput((v) => !v);
              setNewFolderName("");
            }}
          >
            新規フォルダ
          </button>
        )}
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowDocForm((v) => !v);
              setEditingDocId(null);
              setDocForm({ title: "", content: "" });
            }}
          >
            新規ドキュメント
          </button>
        )}
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
              <label className="label" htmlFor="doc-title">タイトル</label>
              <input
                id="doc-title"
                className="input"
                type="text"
                placeholder="タイトル"
                value={docForm.title}
                onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor="doc-content">内容</label>
              <textarea
                id="doc-content"
                className="input"
                placeholder="ドキュメントの内容"
                value={docForm.content}
                onChange={(e) => setDocForm((f) => ({ ...f, content: e.target.value }))}
                rows={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleDocSubmit}>
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
        {isLoading && <div className="empty-state">読み込み中...</div>}

        {!isLoading && folders.length === 0 && documents.length === 0 && (
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
            {canEdit && (
              <div className="flex gap-2">
                <button className="btn btn-sm btn-warn" onClick={() => handleRenameFolder(f)}>名前変更</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFolder(f)}>削除</button>
              </div>
            )}
          </div>
        ))}

        {documents.map((doc, idx) => (
          <div key={doc.id} className={`file-item animate-in stagger-${Math.min(folders.length + idx + 1, 6)}`}>
            <div className="file-icon doc">📄</div>
            <div className="flex-1">
              <div style={{ fontWeight: 500 }}>{doc.title}</div>
              <div className="text-xs text-muted">
                v{doc.currentVersion} | {new Date(doc.updatedAt).toLocaleDateString("ja-JP")}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {canEdit && (
                <>
                  <button className="btn btn-sm btn-warn" onClick={() => startEditDoc(doc)}>編集</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDoc(doc)}>削除</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
