import { useCallback, useEffect, useState } from "react";

import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Trophy,
  FileText,
  CalendarDays,
  Briefcase,
  Bell,
  CreditCard,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";

import {
  getDisplayName,
  getRoleLabel,
} from "../services/authService";

import {
  getUnreadCount,
  NOTIFICATIONS_CHANGED,
} from "../services/notificationService";

import "./Layout.css";
import "../pages/Notifications.css";

// Help icon (circle + question mark) - inline SVG
function HelpIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

// Student dropdown ke andar wale pages
const studentChildren = [
  { key: "examForms", label: "Exam Forms", icon: ClipboardList },
  { key: "exams", label: "Exams", icon: GraduationCap },
  { key: "preparations", label: "Preparation", icon: BookOpen },
  { key: "results", label: "Results", icon: Trophy },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "schedules", label: "Schedule", icon: CalendarDays },
  { key: "documents", label: "Documents", icon: FileText },
];

const overviewItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const opportunityItems = [
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "notifications", label: "Notifications", icon: Bell },
];

const generalItems = [
  { key: "help", label: "Help", icon: HelpIcon },
  { key: "subscription", label: "Subscription", icon: CreditCard },
];

const pageNames = {
  dashboard: "Dashboard",
  examForms: "Exam Forms",
  exams: "Exams",
  preparations: "Preparation",
  results: "Results",
  subjects: "Subjects",
  schedules: "Schedule",
  documents: "Documents",
  jobs: "Jobs",
  notifications: "Notifications",
  help: "Help",
  subscription: "Subscription",
};

function Layout({
  activePage,
  onNavigate,
  user,
  onLogout,
  children,
}) {
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(user);

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "S";

  const [studentOpen, setStudentOpen] = useState(true);

  // Unread notifications (topbar bell + sidebar badge)
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnread(Number(data?.unreadCount) || 0);
    } catch {
      // bell chhupi rehne do, page nahi tootna chahiye
    }
  }, []);

  // Page badalne par + har 1 minute me + notifications badalne par refresh
  useEffect(() => {
    refreshUnread();
  }, [activePage, refreshUnread]);

  useEffect(() => {
    const timer = setInterval(refreshUnread, 60000);

    window.addEventListener(NOTIFICATIONS_CHANGED, refreshUnread);

    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refreshUnread);
    };
  }, [refreshUnread]);

  const unreadLabel = unread > 99 ? "99+" : unread;

  function renderItem(item) {
    const Icon = item.icon;

    return (
      <button
        key={item.key}
        type="button"
        className={`sidebar-item ${
          activePage === item.key ? "active" : ""
        }`}
        onClick={() => onNavigate(item.key)}
      >
        <Icon size={18} />
        <span>{item.label}</span>

        {item.key === "notifications" && unread > 0 && (
          <span className="nt-sidebar-badge">{unreadLabel}</span>
        )}
      </button>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">E</div>

          <div>
            <div className="brand-name">Examo</div>

            <div className="brand-subtitle">
              Student Management
            </div>
          </div>
        </div>

        <nav className="sidebar-nav sidebar-scroll">
          <div className="sidebar-group-title">Overview</div>
          {overviewItems.map(renderItem)}

          <div className="sidebar-group-title">Academics</div>

          <button
            type="button"
            className={`sidebar-item ${
              studentOpen ? "active" : ""
            }`}
            onClick={() => setStudentOpen((open) => !open)}
            aria-expanded={studentOpen}
          >
            <GraduationCap size={18} />
            <span>Student</span>

            <ChevronDown
              size={16}
              className={`sidebar-chevron ${
                studentOpen ? "open" : ""
              }`}
            />
          </button>

          <div
            className={`sidebar-submenu ${
              studentOpen ? "open" : ""
            }`}
          >
            <div className="sidebar-submenu-inner">
              {studentChildren.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`sidebar-subitem ${
                      activePage === item.key ? "active" : ""
                    }`}
                    onClick={() => onNavigate(item.key)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-group-title">
            Opportunities
          </div>
          {opportunityItems.map(renderItem)}

          <div className="sidebar-group-title">General</div>
          {generalItems.map(renderItem)}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{initial}</div>

            <div>
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
          >
            <LogOut size={16} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-menu">
            <Menu size={22} />
          </div>

          <div className="breadcrumb">
            Examo /{" "}
            <strong>{pageNames[activePage] || "Dashboard"}</strong>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="nt-bell"
              onClick={() => onNavigate("notifications")}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />

              {unread > 0 && (
                <span className="nt-bell-badge">{unreadLabel}</span>
              )}
            </button>

            <div className="topbar-profile">
              <div className="avatar">{initial}</div>

              <div>
                <strong>{displayName}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
