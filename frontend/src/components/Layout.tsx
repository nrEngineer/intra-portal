import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 220, background: "#1e293b", color: "#fff", padding: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 24 }}>社内ポータル</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: 8 }}><Link to="/" style={{ color: "#94a3b8", textDecoration: "none" }}>ダッシュボード</Link></li>
          <li style={{ marginBottom: 8 }}><Link to="/announcements" style={{ color: "#94a3b8", textDecoration: "none" }}>お知らせ</Link></li>
          <li style={{ marginBottom: 8 }}><Link to="/employees" style={{ color: "#94a3b8", textDecoration: "none" }}>社員名簿</Link></li>
          <li style={{ marginBottom: 8 }}><Link to="/schedule" style={{ color: "#94a3b8", textDecoration: "none" }}>スケジュール</Link></li>
          <li style={{ marginBottom: 8 }}><Link to="/links" style={{ color: "#94a3b8", textDecoration: "none" }}>リンク集</Link></li>
          <li style={{ marginBottom: 8 }}><Link to="/documents" style={{ color: "#94a3b8", textDecoration: "none" }}>ドキュメント</Link></li>
          {isAdmin && <li style={{ marginBottom: 8 }}><Link to="/users" style={{ color: "#94a3b8", textDecoration: "none" }}>ユーザー管理</Link></li>}
        </ul>
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid #334155" }}>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{user?.name}</p>
          <button onClick={handleLogout} style={{ background: "none", border: "1px solid #475569", color: "#94a3b8", padding: "4px 12px", cursor: "pointer", borderRadius: 4 }}>ログアウト</button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 24, background: "#f8fafc" }}>
        <Outlet />
      </main>
    </div>
  );
}
