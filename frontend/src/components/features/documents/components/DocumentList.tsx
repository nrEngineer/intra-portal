import type { Document } from "../../../../types/document";

interface DocumentListProps {
  documents: Document[];
  folderCount: number;
  canEdit: boolean;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

export function DocumentList({
  documents,
  folderCount,
  canEdit,
  onEdit,
  onDelete,
}: DocumentListProps) {
  return (
    <>
      {documents.map((doc, idx) => (
        <div
          key={doc.id}
          className={`file-item animate-in stagger-${Math.min(folderCount + idx + 1, 6)}`}
        >
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
                <button className="btn btn-sm btn-warn" onClick={() => onEdit(doc)}>
                  編集
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(doc)}>
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
