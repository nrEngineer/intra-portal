import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "ダッシュボード", icon: "◇" },
  { to: "/announcements", label: "お知らせ", icon: "◈" },
  { to: "/employees", label: "社員名簿", icon: "◉" },
  { to: "/schedule", label: "スケジュール", icon: "◎" },
  { to: "/links", label: "リンク集", icon: "◆" },
  { to: "/documents", label: "ドキュメント", icon: "▣" },
];

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const roleLabel = (role?: string) => {
    switch (role) {
      case "admin": return "Administrator";
      case "editor": return "Editor";
      default: return "Member";
    }
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <h1>社内ポータル</h1>
          <div className="brand-sub">Intra Portal</div>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={isActive(item.to) ? "active" : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/users"
              className={isActive("/users") ? "active" : ""}
            >
              <span className="nav-icon">⚙</span>
              ユーザー管理
            </Link>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{roleLabel(user?.role)}</div>
          <button onClick={handleLogout} className="logout-btn">
            ログアウト
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
