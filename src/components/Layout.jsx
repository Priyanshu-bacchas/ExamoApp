import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  CalendarDays,
  Menu,
  LogOut,
} from "lucide-react";

import {
  getDisplayName,
  getRoleLabel,
  isAdmin,
} from "../services/authService";

const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "students",
    label: "Student Records",
    icon: Users,
    adminOnly: true,
  },
  {
    key: "examForms",
    label: "Exam Forms",
    icon: ClipboardList,
  },
  {
    key: "exams",
    label: "Exams",
    icon: GraduationCap,
  },
  {
    key: "preparations",
    label: "Preparation",
    icon: BookOpen,
  },
  {
    key: "subjects",
    label: "Subjects",
    icon: BookOpen,
  },
  {
    key: "schedules",
    label: "Schedule",
    icon: CalendarDays,
  },
];

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

  const visibleMenu = menuItems.filter(
    (item) =>
      !item.adminOnly || isAdmin(user),
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            E
          </div>

          <div>
            <div className="brand-name">
              Examo
            </div>

            <div className="brand-subtitle">
              Student Management
            </div>
          </div>
        </div>

        <div className="sidebar-section-title">
          Main Menu
        </div>

        <nav className="sidebar-nav">
          {visibleMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${
                  activePage === item.key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  onNavigate(item.key)
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">
              {initial}
            </div>

            <div>
              <strong>
                {displayName}
              </strong>

              <span>
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
          >
            <LogOut size={16} />

            <span>
              Logout
            </span>
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
            <strong>
              {getPageName(activePage)}
            </strong>
          </div>

          <div className="topbar-profile">
            <div className="avatar">
              {initial}
            </div>

            <div>
              <strong>
                {displayName}
              </strong>

              <span>
                {roleLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

function getPageName(page) {
  const names = {
    dashboard: "Dashboard",
    students: "Student Records",
    examForms: "Exam Forms",
    exams: "Exams",
    preparations: "Preparation",
    subjects: "Subjects",
    schedules: "Schedule",
  };

  return names[page] || "Dashboard";
}

export default Layout;