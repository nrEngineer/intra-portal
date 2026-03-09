import type { FormEvent } from "react";
import { FormPanel, FormField } from "../../../ui";

interface FormState {
  title: string;
  url: string;
  description: string;
  category: string;
}

interface LinkFormProps {
  form: FormState;
  editingId: number | null;
  error: string;
  categories: string[];
  onChangeForm: (form: FormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function LinkForm({
  form,
  editingId,
  error,
  categories,
  onChangeForm,
  onSubmit,
  onCancel,
}: LinkFormProps) {
  return (
    <FormPanel
      title={editingId ? "リンクを編集" : "新規リンクを追加"}
      error={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={editingId ? "更新" : "追加"}
    >
      <FormField
        label="タイトル *"
        id="link-title"
        value={form.title}
        onChange={(v) => onChangeForm({ ...form, title: v })}
        required
      />
      <FormField
        label="URL *"
        id="link-url"
        value={form.url}
        onChange={(v) => onChangeForm({ ...form, url: v })}
        required
      />
      <div>
        <label className="label" htmlFor="link-category">カテゴリ *</label>
        <input
          id="link-category"
          className="input"
          type="text"
          required
          list="category-list"
          value={form.category}
          onChange={(e) => onChangeForm({ ...form, category: e.target.value })}
        />
        <datalist id="category-list">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <FormField
          label="説明"
          id="link-description"
          value={form.description}
          onChange={(v) => onChangeForm({ ...form, description: v })}
        />
      </div>
    </FormPanel>
  );
}
