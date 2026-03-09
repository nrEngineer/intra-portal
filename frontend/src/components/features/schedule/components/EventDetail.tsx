import type { ScheduleEvent, Team } from "../../../../types/schedule";

interface EventDetailProps {
  event: ScheduleEvent;
  teams: Team[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function EventDetail({
  event,
  teams,
  onEdit,
  onDelete,
  onClose,
}: EventDetailProps) {
  const handleDelete = () => {
    if (!confirm("このイベントを削除しますか？")) return;
    onDelete(event.id);
  };

  const teamName =
    event.teamId != null
      ? teams.find((t) => t.id === event.teamId)?.name ?? String(event.teamId)
      : null;

  return (
    <div
      className="overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="modal animate-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        <h3
          id="event-detail-title"
          style={{ margin: "0 0 var(--sp-2)", fontSize: "var(--fs-lg)" }}
        >
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-muted" style={{ marginBottom: "var(--sp-3)" }}>
            {event.description}
          </p>
        )}

        <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>
          開始: {new Date(event.startDate).toLocaleString("ja-JP")}
        </p>
        <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>
          終了: {new Date(event.endDate).toLocaleString("ja-JP")}
        </p>

        {teamName != null && (
          <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-4)" }}>
            チーム: {teamName}
          </p>
        )}

        <div className="flex gap-2" style={{ marginTop: "var(--sp-5)" }}>
          <button className="btn btn-sm btn-warn" onClick={() => onEdit(event)}>
            編集
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            削除
          </button>
          <button
            className="btn btn-sm btn-ghost"
            style={{ marginLeft: "auto" }}
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
