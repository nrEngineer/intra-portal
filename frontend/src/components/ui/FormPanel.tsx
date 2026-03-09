import type { FormEvent, ReactNode } from "react";

interface FormPanelProps {
  title: string;
  error?: string;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  children: ReactNode;
}

export function FormPanel({
  title,
  error,
  onSubmit,
  onCancel,
  submitLabel = "作成",
  children,
}: FormPanelProps) {
  return (
    <div className="form-panel animate-in">
      <h3>{title}</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          {children}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>キャンセル</button>
        </div>
      </form>
    </div>
  );
}
