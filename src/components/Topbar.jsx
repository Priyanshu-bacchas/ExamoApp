import {
  Bell,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";

function Topbar({ setMobileOpen }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-button notification-button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">P</div>

          <div className="profile-info">
            <strong>Priyanshu</strong>
            <span>Student</span>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export default Topbar;