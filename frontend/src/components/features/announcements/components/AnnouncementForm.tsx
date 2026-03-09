import type { FormEvent } from "react";
import { FormPanel, FormField } from "../../../ui";
import { CATEGORIES } from "../hooks";
import type { AnnouncementFormState } from "../hooks";

interface AnnouncementFormProps {
  form: AnnouncementFormState;
  editingId: number | null;
  error: string;
  onFormChange: (form: AnnouncementFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function AnnouncementForm({
  form,
  editingId,
  error,
  onFormChange,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  return (
    <FormPanel
      title={editingId ? "お知らせ編集" : "新規お知らせ"}
      error={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={editingId ? "更新" : "作成"}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <FormField
          label="タイトル"
          id="ann-title"
          value={form.title}
          onChange={(v) => onFormChange({ ...form, title: v })}
          required
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label className="label" htmlFor="ann-body">本文</label>
        <textarea
          id="ann-body"
          className="input"
          value={form.body}
          onChange={(e) => onFormChange({ ...form, body: e.target.value })}
          required
          rows={6}
        />
      </div>

      <div>
        <label className="label" htmlFor="ann-category">カテゴリ</label>
        <select
          id="ann-category"
          className="select"
          value={form.category}
          onChange={(e) => onFormChange({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="ann-status">ステータス</label>
        <select
          id="ann-status"
          className="select"
          value={form.status}
          onChange={(e) => onFormChange({ ...form, status: e.target.value })}
        >
          <option value="published">公開</option>
          <option value="draft">下書き</option>
        </select>
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(e) => onFormChange({ ...form, pinned: e.target.checked })}
          />
          ピン留め
        </label>
      </div>
    </FormPanel>
  );
}
