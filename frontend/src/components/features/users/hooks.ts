import { useState } from "react";
import type { UserRole } from "../../../types/user";

const emptyForm = { email: "", name: "", password: "", role: "member" as UserRole };

export type UserFormData = typeof emptyForm;

export function useUserForm() {
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const openForm = () => {
    setShowCreate(true);
    setForm(emptyForm);
    setError("");
  };

  const cancelForm = () => {
    setShowCreate(false);
    setForm(emptyForm);
    setError("");
  };

  const toggleForm = () => {
    if (showCreate) {
      cancelForm();
    } else {
      openForm();
    }
  };

  return {
    form,
    setForm,
    showCreate,
    error,
    setError,
    openForm,
    cancelForm,
    toggleForm,
  };
}
