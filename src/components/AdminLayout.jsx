import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Bell,
  CreditCard,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import "../admin.css";
import "./AdminNavBadge.css";

import {
  getAdminUnreadCount,
  NOTIFY_CHANGED_EVENT,
} from "../services/adminNotifyService";

import {
  getDisplayName,
  getRoleLabel,
  isAdmin,
} from "../services/authService";

// Admin ke sections
const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard Insights",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    label: "User Management",
    icon: Users,
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    key: "jobs",
    label: "Content Manager",
    icon: Briefcase,
  },
  {
    key: "notifyme",
    label: "NotifyMe",
    icon: Bell,
  },
  {
    key: "logs",
    label: "Logs & Security",
    icon: ShieldCheck,
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: TrendingUp,
  },
  {
    key: "help",
    label: "Help & Support",
    icon: MessageSquare,
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
  const [unread, setUnread] = useState(0);

  // NotifyMe ka unread count: page badalne par, har 30 second me,
  // aur NotifyMe page me kuch badalne par refresh hota hai
  useEffect(() => {
    if (!isAdmin(user)) return undefined;

    let cancelled = false;

    async function loadUnread() {
      try {
        const data = await getAdminUnreadCount();

        if (!cancelled) setUnread(Number(data?.unreadCount) || 0);
      } catch {
        // Badge fail hone se kuch nahi bigadta
      }
    }

    loadUnread();

    const timer = setInterval(loadUnread, 30000);

    window.addEventListener(NOTIFY_CHANGED_EVENT, loadUnread);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(NOTIFY_CHANGED_EVENT, loadUnread);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

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

                {item.key === "notifyme" && unread > 0 && (
                  <span className="adm-nav-badge">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
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
    users: "User Management",
    payments: "Payments",
    notifyme: "NotifyMe",
    logs: "Logs & Security",
    analytics: "Analytics",
    jobs: "Content Manager",
    help: "Help & Support",
  };

  return names[page] || "Dashboard Insights";
}

export default AdminLayout;