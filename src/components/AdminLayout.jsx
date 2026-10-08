import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import "../admin.css";

import {
  getDisplayName,
  getRoleLabel,
  isAdmin,
} from "../services/authService";

// Admin ko sirf ye 3 sections dikhte hain
const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard Insights",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    label: "User & Role Management",
    icon: Users,
  },
  {
    key: "logs",
    label: "Logs & Security",
    icon: ShieldCheck,
  },
];

function AdminLayout({
  activePage,
  onNavigate,
  user,
  onLogout,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(user);

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "A";

  const visibleMenu = isAdmin(user) ? menuItems : [];

  function go(key) {
    onNavigate(key);
    setMenuOpen(false);
  }

  return (
    <div className="adm-shell">
      {menuOpen && (
        <div
          className="adm-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`adm-sidebar ${menuOpen ? "open" : ""}`}
      >
        <div className="adm-brand">
          <div className="adm-brand-logo">E</div>

          <div>
            <div className="adm-brand-name">Examo</div>

            <div className="adm-brand-sub">Admin Panel</div>
          </div>
        </div>

        <div className="adm-nav-label">Main Menu</div>

        <nav className="adm-nav">
          {visibleMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`adm-nav-item ${
                  activePage === item.key ? "active" : ""
                }`}
                onClick={() => go(item.key)}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="adm-sidebar-bottom">
          <div className="adm-user-card">
            <div className="adm-avatar">{initial}</div>

            <div>
              <strong>{displayName}</strong>

              <span>{roleLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="adm-logout"
            onClick={onLogout}
          >
            <LogOut size={16} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              type="button"
              className="adm-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="adm-crumb">
              Examo /{" "}
              <strong>{getPageName(activePage)}</strong>
            </div>
          </div>

          <div className="adm-profile">
            <div className="adm-profile-text">
              <strong>{displayName}</strong>

              <span>{roleLabel}</span>
            </div>

            <div className="adm-avatar">{initial}</div>
          </div>
        </header>

        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}

function getPageName(page) {
  const names = {
    dashboard: "Dashboard Insights",
    users: "User & Role Management",
    logs: "Logs & Security",
  };

  return names[page] || "Dashboard Insights";
}

export default AdminLayout;
