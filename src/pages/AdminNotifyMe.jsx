import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  CreditCard,
  MessageSquare,
  RefreshCw,
  Trash2,
  Eraser,
  ArrowRight,
} from "lucide-react";

import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  clearReadAdminNotifications,
  emitNotifyChanged,
} from "../services/adminNotifyService";


// Styles isi file me hain (alag CSS file ki zaroorat nahi)
const NOTIFY_CSS = `
/* Admin > NotifyMe */

.nm-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nm-stats {
  margin-bottom: 18px;
}

.nm-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.nm-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px;
  background: #fff;
  border: 1px solid var(--adm-line);
  border-radius: 12px;
}

.nm-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--adm-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nm-tab:hover {
  background: #f1f5f9;
  color: var(--adm-ink);
}

.nm-tab.active {
  background: var(--adm-blue);
  color: #fff;
}

.nm-tab-count {
  min-width: 18px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.nm-search {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 240px;
}

.nm-search input {
  flex: 1;
  min-width: 0;
  padding: 10px 13px;
  border: 1px solid var(--adm-line);
  border-radius: 10px;
  background: #fff;
  color: var(--adm-ink);
  font-size: 13.5px;
  outline: none;
}

.nm-search input:focus {
  border-color: var(--adm-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.nm-list-card {
  padding: 0;
  overflow: hidden;
}

.nm-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nm-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--adm-line);
  cursor: default;
  transition: background 0.15s ease;
}

.nm-item:last-child {
  border-bottom: 0;
}

.nm-item:hover {
  background: #f8fafc;
}

.nm-item.unread {
  background: #f3f7ff;
  box-shadow: inset 3px 0 0 var(--adm-blue);
  cursor: pointer;
}

.nm-item.unread:hover {
  background: #eaf1ff;
}

.nm-icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

.nm-icon-help {
  background: #efeafe;
  color: #6d28d9;
}

.nm-icon-sub {
  background: #e3f6ec;
  color: #15803d;
}

.nm-body {
  flex: 1;
  min-width: 0;
}

.nm-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.nm-title {
  font-size: 14.5px;
  color: var(--adm-ink);
}

.nm-new {
  padding: 2px 8px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.nm-message {
  margin: 6px 0 8px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--adm-text);
  word-break: break-word;
}

.nm-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--adm-muted);
}

.nm-dot {
  opacity: 0.6;
}

.nm-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 900px) {
  .nm-item {
    flex-wrap: wrap;
  }

  .nm-body {
    flex-basis: calc(100% - 60px);
  }

  .nm-actions {
    flex-basis: 100%;
    justify-content: flex-start;
    padding-left: 56px;
  }

  .nm-search {
    flex-basis: 100%;
  }
}
`;

const emptyStats = {
  total: 0,
  unread: 0,
  support: 0,
  subscription: 0,
};

// Naye notifications ke liye auto refresh (milliseconds)
const POLL_MS = 30000;

const TABS = [
  { key: "", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "support", label: "Help messages" },
  { key: "subscription", label: "Subscriptions" },
];

// Card ke halke rang (Content Manager jaise) - isi file me, alag CSS file ki zaroorat nahi
const CARD_TONE_CSS = `
.adm-shell .adm-stat.adm-card-blue   { background: #eff6ff; border-color: #bfdbfe; }
.adm-shell .adm-stat.adm-card-violet { background: #f5f3ff; border-color: #ddd6fe; }
.adm-shell .adm-stat.adm-card-pink   { background: #fdf2f8; border-color: #fbcfe8; }
.adm-shell .adm-stat.adm-card-green  { background: #f0fdf4; border-color: #bbf7d0; }
.adm-shell .adm-stat.adm-card-amber  { background: #fffbeb; border-color: #fde68a; }
.adm-shell .adm-stat.adm-card-teal   { background: #f0fdfa; border-color: #99f6e4; }
.adm-shell .adm-stat.adm-card-red    { background: #fef2f2; border-color: #fecaca; }
.adm-shell .adm-stat.adm-card-slate  { background: #f8fafc; border-color: #e2e8f0; }
`;

function AdminNotifyMe({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(emptyStats);

  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Latest filter values (polling ke liye)
  const filterRef = useRef({ tab, search });

  filterRef.current = { tab, search };

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      setError("");

      const { tab: t, search: s } = filterRef.current;

      const data = await getAdminNotifications({
        type: t === "support" || t === "subscription" ? t : "",
        unreadOnly: t === "unread",
        search: s.trim(),
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
      setStats({ ...emptyStats, ...(data?.stats || {}) });
    } catch (err) {
      console.error(err);

      if (!silent) {
        setError(err.message || "Unable to load notifications.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Tab badalte hi dobara load
  useEffect(() => {
    load();
  }, [tab, load]);

  // Har 30 second me chupchap refresh
  useEffect(() => {
    const timer = setInterval(() => load(true), POLL_MS);

    return () => clearInterval(timer);
  }, [load]);

  // Success notice kuch seconds baad hat jaye
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    load();
  }

  async function handleMarkRead(item) {
    if (item.isRead) return;

    try {
      setBusyId(item.id);
      setError("");

      await markAdminNotificationRead(item.id);

      emitNotifyChanged();
      await load(true);
    } catch (err) {
      setError(err.message || "Unable to update the notification.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    try {
      setBusyId(item.id);
      setError("");

      await deleteAdminNotification(item.id);

      emitNotifyChanged();
      await load(true);
    } catch (err) {
      setError(err.message || "Unable to delete the notification.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      setBulkBusy(true);
      setError("");

      await markAllAdminNotificationsRead();

      setNotice("All notifications marked as read.");

      emitNotifyChanged();
      await load(true);
    } catch (err) {
      setError(err.message || "Unable to update notifications.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleClearRead() {
    if (!window.confirm("Delete all notifications that are already read?")) {
      return;
    }

    try {
      setBulkBusy(true);
      setError("");

      const data = await clearReadAdminNotifications();

      setNotice(data?.message || "Read notifications cleared.");

      emitNotifyChanged();
      await load(true);
    } catch (err) {
      setError(err.message || "Unable to clear notifications.");
    } finally {
      setBulkBusy(false);
    }
  }

  // Notification par click = padh liya
  function openItem(item) {
    if (!item.isRead) handleMarkRead(item);
  }

  function goToSource(item) {
    if (!onNavigate) return;

    // Help message -> Help & Support, Subscription -> Payments
    onNavigate(item.type === "support" ? "help" : "payments");
  }

  return (
    <div>
      <style>{NOTIFY_CSS}</style>
      <style>{CARD_TONE_CSS}</style>

      <div className="adm-heading">
        <div>
          <h1>NotifyMe</h1>
          <p>
            Help messages sent by students and new subscriptions, all in
            one place.
          </p>
        </div>

        <div className="nm-head-actions">
          <button
            type="button"
            className="adm-btn"
            onClick={handleMarkAllRead}
            disabled={bulkBusy || stats.unread === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>

          <button
            type="button"
            className="adm-btn"
            onClick={() => load()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "adm-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="adm-alert">{error}</div>}

      {notice && <div className="adm-notice">{notice}</div>}

      <div className="adm-stats nm-stats">
        <StatCard
          tone="blue"
          icon={<Bell size={20} />}
          title="Total"
          value={stats.total}
          text="All notifications"
        />

        <StatCard
          tone="amber"
          icon={<BellRing size={20} />}
          title="Unread"
          value={stats.unread}
          text="Need your attention"
        />

        <StatCard
          tone="violet"
          icon={<MessageSquare size={20} />}
          title="Help messages"
          value={stats.support}
          text="From Contact Us"
        />

        <StatCard
          tone="green"
          icon={<CreditCard size={20} />}
          title="Subscriptions"
          value={stats.subscription}
          text="Plans purchased"
        />
      </div>

      <div className="nm-toolbar">
        <div className="nm-tabs">
          {TABS.map((t) => (
            <button
              key={t.key || "all"}
              type="button"
              className={`nm-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}

              {t.key === "unread" && stats.unread > 0 && (
                <span className="nm-tab-count">{stats.unread}</span>
              )}
            </button>
          ))}
        </div>

        <form className="nm-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or text..."
          />

          <button type="submit" className="primary-button">
            Search
          </button>
        </form>

        <button
          type="button"
          className="adm-btn adm-btn-danger"
          onClick={handleClearRead}
          disabled={bulkBusy}
        >
          <Eraser size={15} />
          Clear read
        </button>
      </div>

      <div className="data-card nm-list-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications</h3>

            <p>
              When a student sends a help message or buys a plan, it will
              show up here.
            </p>
          </div>
        ) : (
          <ul className="nm-list">
            {items.map((item) => {
              const isSupport = item.type === "support";
              const busy = busyId === item.id;

              return (
                <li
                  key={item.id}
                  className={`nm-item ${item.isRead ? "" : "unread"}`}
                  onClick={() => openItem(item)}
                >
                  <div
                    className={`nm-icon ${
                      isSupport ? "nm-icon-help" : "nm-icon-sub"
                    }`}
                  >
                    {isSupport ? (
                      <MessageSquare size={19} />
                    ) : (
                      <CreditCard size={19} />
                    )}
                  </div>

                  <div className="nm-body">
                    <div className="nm-title-row">
                      <strong className="nm-title">{item.title}</strong>

                      <span
                        className={`adm-pill ${
                          isSupport ? "adm-pill-violet" : "adm-pill-green"
                        }`}
                      >
                        {isSupport ? "Help" : "Subscription"}
                      </span>

                      {!item.isRead && (
                        <span className="nm-new">New</span>
                      )}
                    </div>

                    <p className="nm-message">{item.message}</p>

                    <div className="nm-meta">
                      <span>{timeAgo(item.createdAt)}</span>

                      <span className="nm-dot">•</span>

                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <div
                    className="nm-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => goToSource(item)}
                    >
                      {isSupport ? "Open Help & Support" : "Open Payments"}
                      <ArrowRight size={14} />
                    </button>

                    {!item.isRead && (
                      <button
                        type="button"
                        className="adm-btn"
                        disabled={busy}
                        onClick={() => handleMarkRead(item)}
                      >
                        <CheckCheck size={14} />
                        Mark read
                      </button>
                    )}

                    <button
                      type="button"
                      className="adm-btn adm-btn-danger"
                      disabled={busy}
                      onClick={() => handleDelete(item)}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ tone, icon, title, value, text }) {
  return (
    <div className={`adm-stat adm-card-${tone}`}>
      <div className={`adm-stat-icon adm-tone-${tone}`}>{icon}</div>

      <div className="adm-stat-body">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{text}</small>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);

  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default AdminNotifyMe;
