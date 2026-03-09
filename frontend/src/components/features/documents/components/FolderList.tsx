import type { Folder } from "../../../../types/document";

interface FolderListProps {
  folders: Folder[];
  canEdit: boolean;
  onNavigate: (folder: Folder) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export function FolderList({
  folders,
  canEdit,
  onNavigate,
  onRename,
  onDelete,
}: FolderListProps) {
  return (
    <>
      {folders.map((f, idx) => (
        <div key={f.id} className={`file-item animate-in stagger-${Math.min(idx + 1, 6)}`}>
          <div
            className="file-icon folder"
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate(f)}
          >
            📁
          </div>
          <span
            className="flex-1"
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate(f)}
          >
            {f.name}
          </span>
          {canEdit && (
            <div className="flex gap-2">
              <button className="btn btn-sm btn-warn" onClick={() => onRename(f)}>
                名前変更
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(f)}>
                削除
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
