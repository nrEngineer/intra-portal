import { useState } from "react";
import type { Employee } from "../../../types/employee";

const emptyForm = { name: "", email: "", department: "", position: "", phone: "" };

export type EmployeeFormData = typeof emptyForm;

// UI state for search text and department filter
export function useEmployeeSearch() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  return { search, setSearch, department, setDepartment };
}

// UI state for the create/edit form
export function useEmployeeForm() {
  const [form, setForm] = useState<EmployeeFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const isFormVisible = showForm || editingId !== null;
  const formTitle = editingId ? "社員情報を編集" : "新規社員";
  const submitLabel = editingId ? "更新" : "作成";

  const openCreateForm = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const openEditForm = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      phone: emp.phone || "",
    });
    setShowForm(false);
    setError("");
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const toggleForm = () => {
    if (isFormVisible) {
      cancelForm();
    } else {
      openCreateForm();
    }
  };

  return {
    form,
    setForm,
    editingId,
    showForm,
    error,
    setError,
    isFormVisible,
    formTitle,
    submitLabel,
    openCreateForm,
    openEditForm,
    cancelForm,
    toggleForm,
  };
}
