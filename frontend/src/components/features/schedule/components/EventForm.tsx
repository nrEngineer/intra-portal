import type { Team } from "../../../../types/schedule";
import type { EventFormState } from "../hooks";

interface EventFormProps {
  form: EventFormState;
  editingId: number | null;
  teams: Team[];
  onFieldChange: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EventForm({
  form,
  editingId,
  teams,
  onFieldChange,
  onSubmit,
  onCancel,
}: EventFormProps) {
  return (
    <div className="form-panel animate-in">
      <h3>{editingId ? "イベント編集" : "新規イベント作成"}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <div>
          <label className="label" htmlFor="event-form-title">タイトル *</label>
          <input
            id="event-form-title"
            className="input"
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="イベントタイトル"
          />
        </div>

        <div>
          <label className="label" htmlFor="event-form-description">説明</label>
          <textarea
            id="event-form-description"
            className="input"
            value={form.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder="説明（任意）"
          />
        </div>

        <div className="form-grid">
          <div>
            <label className="label" htmlFor="event-form-start">開始日時 *</label>
            <input
              id="event-form-start"
              className="input"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => onFieldChange("startAt", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="event-form-end">終了日時 *</label>
            <input
              id="event-form-end"
              className="input"
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => onFieldChange("endAt", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="event-form-team">チーム</label>
          <select
            id="event-form-team"
            className="select"
            value={form.teamId}
            onChange={(e) => onFieldChange("teamId", e.target.value)}
          >
            <option value="">チームなし</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => onFieldChange("allDay", e.target.checked)}
          />
          終日イベント
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSubmit}>
            {editingId ? "更新" : "作成"}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
