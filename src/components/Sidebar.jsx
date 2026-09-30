import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  WalletCards,
  MessageSquare,
  Settings,
  CalendarDays,
  FileText,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
  },
  {
    label: "Student Records",
    icon: Users,
    key: "students",
  },
  {
    label: "Academics",
    icon: BookOpen,
    key: "academics",
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
    key: "attendance",
  },
  {
    label: "Exams & Results",
    icon: GraduationCap,
    key: "exams",
  },
  {
    label: "Fees",
    icon: WalletCards,
    key: "fees",
  },
  {
    label: "Communication",
    icon: MessageSquare,
    key: "communication",
  },
  {
    label: "Settings",
    icon: Settings,
    key: "settings",
  },
];

function Sidebar({ activePage, setActivePage, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <GraduationCap size={22} />
          </div>

          <div>
            <div className="logo-title">Examo</div>
            <div className="logo-subtitle">Student Management</div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="menu-title">MAIN MENU</div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.key;

            return (
              <button
                key={item.key}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.key);
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <FileText size={18} />
            </div>

            <div>
              <strong>Need help?</strong>
              <span>Contact support</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;