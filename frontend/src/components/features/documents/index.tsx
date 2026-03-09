import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  useFolders,
  useDocuments,
  useFolderCreate,
  useFolderUpdate,
  useFolderDelete,
  useDocumentCreate,
  useDocumentUpdate,
  useDocumentDelete,
} from "../../../hooks/useDocuments";
import type { Folder, Document } from "../../../types/document";
import { EmptyState } from "../../ui/EmptyState";
import { useFolderNavigation, useDocumentForm, useFolderInput } from "./hooks";
import { FolderBreadcrumb } from "./components/FolderBreadcrumb";
import { FolderList } from "./components/FolderList";
import { DocumentList } from "./components/DocumentList";
import { DocumentForm } from "./components/DocumentForm";

export function DocumentsContainer() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "editor";

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // UI state hooks
  const { currentFolder, folderPath, navigateToFolder, navigateToBreadcrumb } =
    useFolderNavigation();
  const docFormState = useDocumentForm();
  const folderInputState = useFolderInput();

  // Data hooks
  const { data: folders = [] } = useFolders(currentFolder);
  const { data: documents = [], isLoading } = useDocuments({
    folderId: currentFolder ?? undefined,
    search: search || undefined,
  });

  // Mutation hooks
  const createFolder = useFolderCreate();
  const updateFolder = useFolderUpdate();
  const deleteFolder = useFolderDelete();
  const createDoc = useDocumentCreate();
  const updateDoc = useDocumentUpdate();
  const deleteDoc = useDocumentDelete();

  // ---------------------------------------------------------------------------
  // Folder handlers
  // ---------------------------------------------------------------------------
  const handleCreateFolder = () => {
    const { newFolderName, closeInput } = folderInputState;
    if (!newFolderName.trim()) return;
    createFolder.mutate(
      { name: newFolderName, parentId: currentFolder ?? undefined },
      {
        onSuccess: () => {
          closeInput();
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
        onSuccess: () => setError(""),
        onError: (err) => {
          setError(err instanceof Error ? err.message : "名前変更に失敗しました");
        },
      }
    );
  };

  const handleDeleteFolder = (f: Folder) => {
    if (!confirm(`フォルダ「${f.name}」を削除しますか？`)) return;
    deleteFolder.mutate(f.id, {
      onSuccess: () => setError(""),
      onError: (err) => {
        alert(err instanceof Error ? err.message : "削除に失敗しました");
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Document handlers
  // ---------------------------------------------------------------------------
  const handleDocSubmit = () => {
    const { docForm, editingDocId, cancel } = docFormState;
    if (!docForm.title.trim()) return;

    if (editingDocId) {
      updateDoc.mutate(
        { id: editingDocId, title: docForm.title, content: docForm.content },
        {
          onSuccess: () => {
            cancel();
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
            cancel();
            setError("");
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : "ドキュメントの作成に失敗しました");
          },
        }
      );
    }
  };

  const handleDeleteDoc = (doc: Document) => {
    if (!confirm(`ドキュメント「${doc.title}」を削除しますか？`)) return;
    deleteDoc.mutate(doc.id, {
      onSuccess: () => setError(""),
      onError: (err) => {
        alert(err instanceof Error ? err.message : "削除に失敗しました");
      },
    });
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
            onClick={folderInputState.showFolderInput ? folderInputState.closeInput : folderInputState.openInput}
          >
            新規フォルダ
          </button>
        )}
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={docFormState.showDocForm ? docFormState.cancel : docFormState.openCreate}
          >
            新規ドキュメント
          </button>
        )}
      </div>

      {folderInputState.showFolderInput && (
        <div className="toolbar mb-4">
          <input
            className="input"
            style={{ flex: 1 }}
            type="text"
            placeholder="フォルダ名"
            value={folderInputState.newFolderName}
            onChange={(e) => folderInputState.setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleCreateFolder}>
            作成
          </button>
          <button className="btn btn-ghost" onClick={folderInputState.closeInput}>
            キャンセル
          </button>
        </div>
      )}

      {docFormState.showDocForm && (
        <DocumentForm
          editingDocId={docFormState.editingDocId}
          docForm={docFormState.docForm}
          error=""
          onChange={(field, value) =>
            docFormState.setDocForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={handleDocSubmit}
          onCancel={docFormState.cancel}
        />
      )}

      <FolderBreadcrumb folderPath={folderPath} onNavigate={navigateToBreadcrumb} />

      <div className="card">
        <EmptyState
          isLoading={isLoading}
          isEmpty={folders.length === 0 && documents.length === 0}
          emptyText="アイテムはありません"
        >
          <FolderList
            folders={folders}
            canEdit={canEdit}
            onNavigate={navigateToFolder}
            onRename={handleRenameFolder}
            onDelete={handleDeleteFolder}
          />
          <DocumentList
            documents={documents}
            folderCount={folders.length}
            canEdit={canEdit}
            onEdit={docFormState.startEdit}
            onDelete={handleDeleteDoc}
          />
        </EmptyState>
      </div>
    </div>
  );
}
