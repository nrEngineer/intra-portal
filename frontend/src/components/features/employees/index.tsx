import type { FormEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  useEmployees,
  useEmployeeCreate,
  useEmployeeUpdate,
  useEmployeeDelete,
} from "../../../hooks/useEmployees";
import type { Employee } from "../../../types/employee";
import { PageHeader } from "../../ui/PageHeader";
import { useEmployeeSearch, useEmployeeForm } from "./hooks";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeForm } from "./components/EmployeeForm";

export function EmployeesFeature() {
  const { isAdmin } = useAuth();

  const { search, setSearch, department, setDepartment } = useEmployeeSearch();
  const {
    form,
    setForm,
    editingId,
    error,
    setError,
    isFormVisible,
    formTitle,
    submitLabel,
    openEditForm,
    cancelForm,
    toggleForm,
  } = useEmployeeForm();

  const { data: employees = [], isLoading } = useEmployees({
    search: search || undefined,
    department: department || undefined,
  });

  const departments = [...new Set(employees.map((e) => e.department))].sort();

  const createMutation = useEmployeeCreate();
  const updateMutation = useEmployeeUpdate();
  const deleteMutation = useEmployeeDelete();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }
      cancelForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingId
          ? "更新に失敗しました"
          : "作成に失敗しました"
      );
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`${emp.name} を削除しますか？`)) return;
    try {
      await deleteMutation.mutateAsync(emp.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <div>
      <PageHeader
        title="社員名簿"
        action={
          isAdmin
            ? {
                label: isFormVisible ? "キャンセル" : "新規社員",
                onClick: toggleForm,
              }
            : undefined
        }
      />

      {isAdmin && isFormVisible && (
        <EmployeeForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
          title={formTitle}
          submitLabel={submitLabel}
          error={error}
        />
      )}

      <div className="toolbar animate-in stagger-1">
        <input
          className="input flex-1"
          type="text"
          placeholder="名前・部署・役職で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          style={{ width: "auto" }}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">全部署</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />
    </div>
  );
}
