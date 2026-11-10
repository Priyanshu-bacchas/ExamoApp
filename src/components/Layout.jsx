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
  Lock,
  Library,
  Gift,
  Crown,
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
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 5" />
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

// Ebook dropdown ke andar wale pages
const ebookChildren = [
  { key: "ebookFree", label: "Free", icon: Gift },
  { key: "ebookPaid", label: "Paid", icon: Crown },
];

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "studentGroup", label: "Student", icon: ClipboardList, children: studentChildren },
  { key: "ebookGroup", label: "Ebooks", icon: Library, children: ebookChildren },
  { key: "jobs", label: "Latest Jobs", icon: Briefcase },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "help", label: "Help", icon: HelpIcon },
];

function Layout({ activePage, onNavigate, user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [ebookOpen, setEbookOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error("Unable to load unread notifications:", error);
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    window.addEventListener(NOTIFICATIONS_CHANGED, refreshUnread);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, refreshUnread);
  }, [refreshUnread]);

  useEffect(() => {
    if (studentChildren.some((item) => item.key === activePage)) setStudentOpen(true);
    if (ebookChildren.some((item) => item.key === activePage)) setEbookOpen(true);
  }, [activePage]);

  const navigate = (key) => {
    onNavigate(key);
    setSidebarOpen(false);
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = activePage === item.key;
    return (
      <button
        type="button"
        key={item.key}
        className={`nav-item ${active ? "active" : ""}`}
        onClick={() => navigate(item.key)}
      >
        <Icon size={18} />
        <span>{item.label}</span>
        {item.key === "notifications" && unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>
    );
  };

  const renderGroup = (item, open, setOpen) => {
    const Icon = item.icon;
    const active = item.children.some((child) => child.key === activePage);
    return (
      <div className="nav-group" key={item.key}>
        <button
          type="button"
          className={`nav-item nav-group-toggle ${active ? "active" : ""}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <Icon size={18} />
          <span>{item.label}</span>
          <ChevronDown size={16} className={open ? "rotated" : ""} />
        </button>
        {open && (
          <div className="nav-children">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <button
                  type="button"
                  key={child.key}
                  className={`nav-child ${activePage === child.key ? "active" : ""}`}
                  onClick={() => navigate(child.key)}
                >
                  <ChildIcon size={16} />
                  <span>{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-layout">
      <header className="mobile-header">
        <button type="button" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <strong>ExamoApp</strong>
        <span>{getDisplayName(user)}</span>
      </header>

      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">E</div>
          <div><strong>ExamoApp</strong><small>{getRoleLabel(user)}</small></div>
          <button type="button" className="mobile-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            if (item.children) {
              return item.key === "studentGroup"
                ? renderGroup(item, studentOpen, setStudentOpen)
                : renderGroup(item, ebookOpen, setEbookOpen);
            }
            return renderItem(item);
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-avatar">{(getDisplayName(user) || "U").charAt(0).toUpperCase()}</span>
            <div><strong>{getDisplayName(user)}</strong><small>{getRoleLabel(user)}</small></div>
          </div>
          <button type="button" className="logout-button" onClick={onLogout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;