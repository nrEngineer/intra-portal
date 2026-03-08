import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  joinDate: string;
  joinedAt?: string;
}

const emptyForm = { name: "", email: "", department: "", position: "", phone: "", joinedAt: "" };

export function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);
    api<{ data: Employee[] }>(`/employees?${params.toString()}`).then((res) => {
      setEmployees(res.data);
      if (!departments.length) {
        const depts = [...new Set(res.data.map((e) => e.department))].sort();
        setDepartments(depts);
      }
    });
  };

  useEffect(() => {
    loadEmployees();
  }, [search, department]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/employees", { method: "POST", body: form });
      setForm(emptyForm);
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
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
      joinedAt: emp.joinedAt || emp.joinDate || "",
    });
    setShowForm(false);
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    try {
      await api(`/employees/${editingId}`, { method: "PUT", body: form });
      setForm(emptyForm);
      setEditingId(null);
      loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`${emp.name} を削除しますか？`)) return;
    try {
      await api(`/employees/${emp.id}`, { method: "DELETE" });
      loadEmployees();
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
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="form-grid">
              <div>
                <label className="label">名前</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">メール</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">部署</label>
                <input
                  className="input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">役職</label>
                <input
                  className="input"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">電話</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">入社日</label>
                <input
                  className="input"
                  type="date"
                  value={form.joinedAt}
                  onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
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

      {employees.length === 0 ? (
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
