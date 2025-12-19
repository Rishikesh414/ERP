import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./styles/ParentLayout.css";

export default function ParentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/parent/login");
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: "/parent/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/parent/reports", label: "Reports", icon: "📝" },
    { path: "/parent/fees", label: "Fees", icon: "💳" },
    { path: "/parent/profile", label: "Student Profile", icon: "👤" },
  ];

  return (
    <div className="parent-layout">
      {/* Mobile Header */}
      <div className="parent-mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <h1 className="mobile-title">Parent Portal</h1>
        <button className="logout-mobile" onClick={handleLogout}>
          ✕
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`parent-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">👨‍👩‍👧‍👦</span>
            <h2>Parent Portal</h2>
          </div>
        </div>

        <div className="user-section">
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">Parent</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="parent-main">
        <Outlet />
      </main>
    </div>
  );
}
