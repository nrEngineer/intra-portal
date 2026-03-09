import type { FormEvent } from "react";
import { FormPanel } from "../../../ui/FormPanel";
import { FormField } from "../../../ui/FormField";
import type { EmployeeFormData } from "../hooks";

interface EmployeeFormProps {
  form: EmployeeFormData;
  onChange: (form: EmployeeFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  title: string;
  submitLabel: string;
  error: string;
}

export function EmployeeForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  title,
  submitLabel,
  error,
}: EmployeeFormProps) {
  return (
    <FormPanel
      title={title}
      error={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={submitLabel}
    >
      <FormField
        label="名前"
        id="emp-name"
        value={form.name}
        onChange={(value) => onChange({ ...form, name: value })}
        required
      />
      <FormField
        label="メール"
        id="emp-email"
        type="email"
        value={form.email}
        onChange={(value) => onChange({ ...form, email: value })}
        required
      />
      <FormField
        label="部署"
        id="emp-department"
        value={form.department}
        onChange={(value) => onChange({ ...form, department: value })}
        required
      />
      <FormField
        label="役職"
        id="emp-position"
        value={form.position}
        onChange={(value) => onChange({ ...form, position: value })}
        required
      />
      <FormField
        label="電話"
        id="emp-phone"
        value={form.phone}
        onChange={(value) => onChange({ ...form, phone: value })}
      />
    </FormPanel>
  );
}
