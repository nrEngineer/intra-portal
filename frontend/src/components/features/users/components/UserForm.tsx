import type { FormEvent } from "react";
import type { UserRole } from "../../../../types/user";
import type { UserFormData } from "../hooks";
import { FormPanel, FormField } from "../../../ui";

interface UserFormProps {
  form: UserFormData;
  error: string;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  onChange: (form: UserFormData) => void;
}

export function UserForm({ form, error, onSubmit, onCancel, onChange }: UserFormProps) {
  return (
    <FormPanel
      title="新規ユーザー"
      error={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="作成"
    >
      <FormField
        label="名前"
        id="user-name"
        value={form.name}
        onChange={(value) => onChange({ ...form, name: value })}
        required
      />
      <FormField
        label="メール"
        id="user-email"
        type="email"
        value={form.email}
        onChange={(value) => onChange({ ...form, email: value })}
        required
      />
      <FormField
        label="パスワード"
        id="user-password"
        type="password"
        value={form.password}
        onChange={(value) => onChange({ ...form, password: value })}
        required
      />
      <FormField label="ロール" id="user-role" value={form.role} onChange={() => {}}>
        <select
          id="user-role"
          className="select"
          value={form.role}
          onChange={(e) => onChange({ ...form, role: e.target.value as UserRole })}
        >
          <option value="member">メンバー</option>
          <option value="editor">エディター</option>
          <option value="admin">管理者</option>
        </select>
      </FormField>
    </FormPanel>
  );
}
