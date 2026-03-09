import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  children?: ReactNode;
}

export function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children ?? (
        <input
          id={id}
          className="input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
