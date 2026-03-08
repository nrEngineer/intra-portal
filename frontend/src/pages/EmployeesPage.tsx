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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>社員名簿</h1>
        {isAdmin && (
          <button
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
            style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            {isFormVisible ? "キャンセル" : "新規社員"}
          </button>
        )}
      </div>

      {isAdmin && isFormVisible && (
        <form
          onSubmit={editingId ? handleUpdate : handleCreate}
          style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: 24 }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 16, marginTop: 0 }}>{formTitle}</h2>
          {error && <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>名前</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>メール</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>部署</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>役職</label>
              <input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                required
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>電話</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>入社日</label>
              <input
                type="date"
                value={form.joinedAt}
                onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{ marginTop: 12, padding: "8px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            {editingId ? "更新" : "作成"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="名前・部署・役職で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4, flex: 1 }}
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 4 }}
        >
          <option value="">全部署</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {employees.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>社員が見つかりません</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>名前</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>部署</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>役職</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>メール</th>
                <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>電話</th>
                {isAdmin && <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>操作</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>{emp.name}</td>
                  <td style={{ padding: 12, color: "#64748b" }}>{emp.department}</td>
                  <td style={{ padding: 12, color: "#64748b" }}>{emp.position}</td>
                  <td style={{ padding: 12 }}>
                    <a href={`mailto:${emp.email}`} style={{ color: "#3b82f6" }}>{emp.email}</a>
                  </td>
                  <td style={{ padding: 12, color: "#64748b" }}>{emp.phone || "-"}</td>
                  {isAdmin && (
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleEdit(emp)}
                        style={{ padding: "4px 8px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, marginRight: 4 }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        style={{ padding: "4px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                      >
                        削除
                      </button>
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
