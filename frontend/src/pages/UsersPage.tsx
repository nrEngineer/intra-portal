import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const roleLabelMap: Record<string, string> = {
  admin: "管理者",
  editor: "エディター",
  member: "メンバー",
};

const roleBadgeClass: Record<string, string> = {
  admin: "badge badge-accent",
  editor: "badge badge-info",
  member: "badge badge-default",
};

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

  const handleDelete = async (u: User) => {
    if (!confirm(`${u.name} を削除しますか？`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <h1 className="page-title">ユーザー管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowCreate(!showCreate);
            setError("");
          }}
        >
          {showCreate ? "キャンセル" : "新規ユーザー"}
        </button>
      </div>

      {showCreate && (
        <div className="form-panel animate-in">
          <h3>新規ユーザー</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
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
                <label className="label">パスワード</label>
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">ロール</label>
                <select
                  className="select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="member">メンバー</option>
                  <option value="editor">エディター</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">作成</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowCreate(false); setError(""); }}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap animate-in stagger-1">
        <table className="table">
          <thead>
            <tr>
              <th>名前</th>
              <th>メール</th>
              <th>ロール</th>
              <th>作成日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={roleBadgeClass[u.role] ?? "badge badge-default"}>
                      {roleLabelMap[u.role] ?? u.role}
                    </span>
                    <select
                      className="select"
                      style={{ width: "auto", padding: "var(--sp-1) var(--sp-3)", paddingRight: "var(--sp-8)" }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="member">メンバー</option>
                      <option value="editor">エディター</option>
                      <option value="admin">管理者</option>
                    </select>
                  </div>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
