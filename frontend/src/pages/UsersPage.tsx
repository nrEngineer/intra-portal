import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "member" });
  const [error, setError] = useState("");

  const loadUsers = () => {
    api<{ data: User[] }>("/users").then((res) => setUsers(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/users", { method: "POST", body: form });
      setForm({ email: "", name: "", password: "", role: "member" });
      setShowCreate(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api(`/users/${userId}/role`, { method: "PUT", body: { role } });
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "変更に失敗しました");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>ユーザー管理</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          {showCreate ? "キャンセル" : "新規ユーザー"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: 24 }}>
          {error && <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>名前</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>メール</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>パスワード</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>ロール</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, boxSizing: "border-box" }}>
                <option value="member">メンバー</option>
                <option value="editor">エディター</option>
                <option value="admin">管理者</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ marginTop: 12, padding: "8px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>作成</button>
        </form>
      )}

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>名前</th>
              <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>メール</th>
              <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>ロール</th>
              <th style={{ padding: 12, textAlign: "left", fontSize: 14 }}>作成日</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12 }}>{u.name}</td>
                <td style={{ padding: 12, color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: 12 }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={{ padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4 }}
                  >
                    <option value="member">メンバー</option>
                    <option value="editor">エディター</option>
                    <option value="admin">管理者</option>
                  </select>
                </td>
                <td style={{ padding: 12, color: "#94a3b8", fontSize: 14 }}>{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
