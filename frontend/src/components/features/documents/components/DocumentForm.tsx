import type { FormEvent } from "react";
import { FormPanel } from "../../../ui/FormPanel";
import { FormField } from "../../../ui/FormField";
import type { DocFormState } from "../hooks";

interface DocumentFormProps {
  editingDocId: number | null;
  docForm: DocFormState;
  error: string;
  onChange: (field: keyof DocFormState, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function DocumentForm({
  editingDocId,
  docForm,
  error,
  onChange,
  onSubmit,
  onCancel,
}: DocumentFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <FormPanel
      title={editingDocId ? "ドキュメント編集" : "新規ドキュメント"}
      error={error}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={editingDocId ? "更新" : "作成"}
    >
      <FormField
        label="タイトル"
        id="doc-title"
        value={docForm.title}
        onChange={(v) => onChange("title", v)}
        required
        placeholder="タイトル"
      />
      <FormField label="内容" id="doc-content" value={docForm.content} onChange={(v) => onChange("content", v)}>
        <textarea
          id="doc-content"
          className="input"
          placeholder="ドキュメントの内容"
          value={docForm.content}
          onChange={(e) => onChange("content", e.target.value)}
          rows={6}
        />
      </FormField>
    </FormPanel>
  );
}
