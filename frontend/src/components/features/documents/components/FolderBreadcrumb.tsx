import type { Folder } from "../../../../types/document";

interface FolderBreadcrumbProps {
  folderPath: Folder[];
  onNavigate: (index: number) => void;
}

export function FolderBreadcrumb({ folderPath, onNavigate }: FolderBreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <button onClick={() => onNavigate(-1)}>ルート</button>
      {folderPath.map((f, i) => (
        <span key={f.id} className="flex items-center">
          <span className="separator">/</span>
          {i === folderPath.length - 1 ? (
            <span className="current">{f.name}</span>
          ) : (
            <button onClick={() => onNavigate(i)}>{f.name}</button>
          )}
        </span>
      ))}
    </div>
  );
}
