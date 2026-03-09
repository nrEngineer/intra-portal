import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEmployees, useEmployeeCreate, useEmployeeUpdate, useEmployeeDelete } from "../hooks/useEmployees";
import type { Employee } from "../types/employee";

const emptyForm = { name: "", email: "", department: "", position: "", phone: "" };

export function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const { data: employees = [], isLoading } = useEmployees({ search: search || undefined, department: department || undefined });

  const departments = [...new Set(employees.map((e) => e.department))].sort();

  const createMutation = useEmployeeCreate();
  const updateMutation = useEmployeeUpdate();
  const deleteMutation = useEmployeeDelete();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : editingId ? "更新に失敗しました" : "作成に失敗しました");
    }
  };

  const handleEdit = (emp: Employee) => {
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

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`${emp.name} を削除しますか？`)) return;
    try {
      await deleteMutation.mutateAsync(emp.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const handleCancelForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const isFormVisible = showForm || editingId !== null;
  const formTitle = editingId ? "社員情報を編集" : "新規社員";

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <h1 className="page-title">社員名簿</h1>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isFormVisible) {
                handleCancelForm();
              } else {
                setShowForm(true);
                setEditingId(null);
                setForm(emptyForm);
                setError("");
              }
            }}
          >
            {isFormVisible ? "キャンセル" : "新規社員"}
          </button>
        )}
      </div>

      {isAdmin && isFormVisible && (
        <div className="form-panel animate-in">
          <h3>{formTitle}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="emp-name">名前</label>
                <input
                  id="emp-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="emp-email">メール</label>
                <input
                  id="emp-email"
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="emp-department">部署</label>
                <input
                  id="emp-department"
                  className="input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="emp-position">役職</label>
                <input
                  id="emp-position"
                  className="input"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="emp-phone">電話</label>
                <input
                  id="emp-phone"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "更新" : "作成"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancelForm}>
                キャンセル
              </button>
            </div>
          </form>
        </div>
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
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="empty-state animate-in stagger-2">読み込み中...</div>
      ) : employees.length === 0 ? (
        <div className="empty-state animate-in stagger-2">社員が見つかりません</div>
      ) : (
        <div className="table-wrap animate-in stagger-2">
          <table className="table">
            <thead>
              <tr>
                <th>名前</th>
                <th>部署</th>
                <th>役職</th>
                <th>メール</th>
                <th>電話</th>
                {isAdmin && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>
                    <a href={`mailto:${emp.email}`} style={{ color: "var(--c-info)" }}>
                      {emp.email}
                    </a>
                  </td>
                  <td>{emp.phone || "-"}</td>
                  {isAdmin && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-warn"
                          onClick={() => handleEdit(emp)}
                        >
                          編集
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(emp)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
