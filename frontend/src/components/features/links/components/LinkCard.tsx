import type { InternalLink } from "../../../../types/link";

interface LinkCardProps {
  link: InternalLink;
  animationDelay: number;
  canEdit: boolean;
  onEdit: (link: InternalLink) => void;
  onDelete: (link: InternalLink) => void;
}

export function LinkCard({ link, animationDelay, canEdit, onEdit, onDelete }: LinkCardProps) {
  return (
    <div
      className="animate-in"
      style={{ animationDelay: `${animationDelay}ms`, position: "relative" }}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-card"
        style={canEdit ? { paddingRight: "calc(var(--sp-6) + 80px)" } : undefined}
      >
        <div className="link-card-title">{link.title}</div>
        {link.description && (
          <div className="link-card-desc">{link.description}</div>
        )}
      </a>
      {canEdit && (
        <div
          style={{
            position: "absolute",
            top: "var(--sp-3)",
            right: "var(--sp-3)",
            display: "flex",
            gap: "var(--sp-1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-sm btn-warn"
            onClick={(e) => {
              e.preventDefault();
              onEdit(link);
            }}
          >
            編集
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.preventDefault();
              onDelete(link);
            }}
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
