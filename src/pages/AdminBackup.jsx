import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  Bell,
  Briefcase,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  getAdminBackups,
  getAdminBackupDetail,
  restoreAdminBackup,
  deleteAdminBackup,
} from "../services/adminBackupService";

import { emitNotifyChanged } from "../services/adminNotifyService";

// Styles isi file me hain (alag CSS file ki zaroorat nahi)
const BACKUP_CSS = `
.bk-head-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.bk-stats { margin-bottom: 18px; }

.bk-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.bk-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px;
  background: #fff;
  border: 1px solid var(--adm-line);
  border-radius: 12px;
}

.bk-tab {
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

.bk-tab:hover { background: #f1f5f9; color: var(--adm-ink); }
.bk-tab.active { background: var(--adm-blue); color: #fff; }

.bk-search { display: flex; flex: 1; gap: 8px; min-width: 240px; }

.bk-search input {
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

.bk-search input:focus {
  border-color: var(--adm-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.bk-info {
  margin-bottom: 14px;
  padding: 11px 14px;
  border: 1px solid #dbe5f5;
  border-radius: 10px;
  background: #f3f7ff;
  color: #3b4a68;
  font-size: 13px;
  line-height: 1.5;
}

.bk-list-card { padding: 0; overflow: hidden; }
.bk-list { margin: 0; padding: 0; list-style: none; }

.bk-item { border-bottom: 1px solid var(--adm-line); }
.bk-item:last-child { border-bottom: 0; }

.bk-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
}

.bk-icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

.bk-icon-content { background: #e3eefe; color: #1d4ed8; }
.bk-icon-notifyme { background: #fff1d6; color: #b45309; }
.bk-icon-help { background: #efeafe; color: #6d28d9; }

.bk-body { flex: 1; min-width: 0; }

.bk-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.bk-title { font-size: 14.5px; color: var(--adm-ink); word-break: break-word; }

.bk-pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.bk-pill-content { background: #e3eefe; color: #1d4ed8; }
.bk-pill-notifyme { background: #fff1d6; color: #b45309; }
.bk-pill-help { background: #efeafe; color: #6d28d9; }

.bk-summary {
  margin: 6px 0 8px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--adm-text);
  word-break: break-word;
}

.bk-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--adm-muted);
}

.bk-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.bk-detail {
  margin: 0 20px 16px 76px;
  padding: 14px 16px;
  border: 1px solid var(--adm-line);
  border-radius: 12px;
  background: #f8fafc;
}

.bk-detail-grid {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 8px 16px;
  font-size: 13px;
}

.bk-detail-key { color: var(--adm-muted); font-weight: 600; }
.bk-detail-val { color: var(--adm-ink); white-space: pre-wrap; word-break: break-word; }

@media (max-width: 900px) {
  .bk-row { flex-wrap: wrap; }
  .bk-body { flex-basis: calc(100% - 60px); }
  .bk-actions { flex-basis: 100%; justify-content: flex-start; padding-left: 56px; }
  .bk-detail { margin-left: 20px; }
  .bk-detail-grid { grid-template-columns: 1fr; }
  .bk-search { flex-basis: 100%; }
}
`;

const emptyStats = { total: 0, content: 0, notifyme: 0, help: 0 };

const TABS = [
  { key: "", label: "All" },
  { key: "content", label: "Content Manager" },
  { key: "notifyme", label: "NotifyMe" },
  { key: "help", label: "Help & Support" },
];

const SECTION_LABEL = {
  content: "Content Manager",
  notifyme: "NotifyMe",
  help: "Help & Support",
};

const SECTION_ICON = {
  content: Briefcase,
  notifyme: Bell,
  help: MessageSquare,
};

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

function AdminBackup() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(emptyStats);

  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const filterRef = useRef({ tab, search });

  filterRef.current = { tab, search };

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      setError("");

      const { tab: t, search: s } = filterRef.current;

      const data = await getAdminBackups({
        section: t,
        search: s.trim(),
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
      setStats({ ...emptyStats, ...(data?.stats || {}) });
    } catch (err) {
      console.error(err);

      if (!silent) {
        setError(err.message || "Unable to load backup.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOpenId(null);
    setDetail(null);
    load();
  }, [tab, load]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    load();
  }

  async function toggleDetail(item) {
    if (openId === item.id) {
      setOpenId(null);
      setDetail(null);
      return;
    }

    setOpenId(item.id);
    setDetail(null);

    try {
      setDetailLoading(true);

      const data = await getAdminBackupDetail(item.id);

      setDetail(data?.data || {});
    } catch (err) {
      setError(err.message || "Unable to load saved data.");
      setOpenId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleRestore(item) {
    if (
      !window.confirm(
        `Restore "${item.title}" to ${SECTION_LABEL[item.section] || "its section"}?`
      )
    ) {
      return;
    }

    try {
      setBusyId(item.id);
      setError("");

      const data = await restoreAdminBackup(item.id);

      setNotice(data?.message || "Restored.");

      setOpenId(null);
      setDetail(null);

      // NotifyMe restore hone par sidebar count badal sakta hai
      emitNotifyChanged();

      await load(true);
    } catch (err) {
      setError(err.message || "Unable to restore this item.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteForever(item) {
    if (
      !window.confirm(
        `Delete "${item.title}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setBusyId(item.id);
      setError("");

      await deleteAdminBackup(item.id);

      setNotice("Deleted permanently.");

      if (openId === item.id) {
        setOpenId(null);
        setDetail(null);
      }

      await load(true);
    } catch (err) {
      setError(err.message || "Unable to delete this item.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <style>{BACKUP_CSS}</style>
      <style>{CARD_TONE_CSS}</style>

      <div className="adm-heading">
        <div>
          <h1>Backup &amp; Restore</h1>
          <p>
            Data deleted from Content Manager, NotifyMe and Help &amp;
            Support is saved here. You can restore it anytime.
          </p>
        </div>

        <div className="bk-head-actions">
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

      <div className="adm-stats bk-stats">
        <StatCard
          tone="blue"
          icon={<Archive size={20} />}
          title="Total"
          value={stats.total}
          text="All deleted items"
        />

        <StatCard
          tone="violet"
          icon={<Briefcase size={20} />}
          title="Content Manager"
          value={stats.content}
          text="Jobs, results, admit cards"
        />

        <StatCard
          tone="amber"
          icon={<Bell size={20} />}
          title="NotifyMe"
          value={stats.notifyme}
          text="Deleted notifications"
        />

        <StatCard
          tone="green"
          icon={<MessageSquare size={20} />}
          title="Help & Support"
          value={stats.help}
          text="Deleted messages"
        />
      </div>

      <div className="bk-toolbar">
        <div className="bk-tabs">
          {TABS.map((t) => (
            <button
              key={t.key || "all"}
              type="button"
              className={`bk-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form className="bk-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, text or admin name..."
          />

          <button type="submit" className="primary-button">
            Search
          </button>
        </form>
      </div>

      <div className="bk-info">
        Restoring adds the item back as a new entry. For a deleted Job,
        the Exam / Result / Admit Card entries that were created from it
        are not saved here.
      </div>

      <div className="data-card bk-list-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>Backup is empty</h3>

            <p>
              When you delete something from Content Manager, NotifyMe
              or Help &amp; Support, it will show up here.
            </p>
          </div>
        ) : (
          <ul className="bk-list">
            {items.map((item) => {
              const Icon = SECTION_ICON[item.section] || Archive;
              const busy = busyId === item.id;
              const open = openId === item.id;

              return (
                <li key={item.id} className="bk-item">
                  <div className="bk-row">
                    <div className={`bk-icon bk-icon-${item.section}`}>
                      <Icon size={19} />
                    </div>

                    <div className="bk-body">
                      <div className="bk-title-row">
                        <strong className="bk-title">{item.title}</strong>

                        <span className={`bk-pill bk-pill-${item.section}`}>
                          {SECTION_LABEL[item.section] || item.section}
                        </span>

                        <span className="bk-pill bk-pill-content">
                          {item.itemType}
                        </span>
                      </div>

                      {item.summary && (
                        <p className="bk-summary">{item.summary}</p>
                      )}

                      <div className="bk-meta">
                        <span>Deleted {timeAgo(item.deletedAt)}</span>

                        <span>•</span>

                        <span>{formatDateTime(item.deletedAt)}</span>

                        {item.deletedBy && (
                          <>
                            <span>•</span>
                            <span>by {item.deletedBy}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bk-actions">
                      <button
                        type="button"
                        className="adm-btn"
                        onClick={() => toggleDetail(item)}
                      >
                        {open ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                        {open ? "Hide" : "View"}
                      </button>

                      <button
                        type="button"
                        className="adm-btn"
                        disabled={busy}
                        onClick={() => handleRestore(item)}
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>

                      <button
                        type="button"
                        className="adm-btn adm-btn-danger"
                        disabled={busy}
                        onClick={() => handleDeleteForever(item)}
                        aria-label="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="bk-detail">
                      {detailLoading || !detail ? (
                        <div className="loading-state">Loading...</div>
                      ) : (
                        <div className="bk-detail-grid">
                          {Object.entries(detail)
                            .filter(
                              ([, value]) =>
                                value !== null && value !== ""
                            )
                            .map(([key, value]) => (
                              <Row key={key} label={key} value={value} />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <>
      <div className="bk-detail-key">{humanize(label)}</div>

      <div className="bk-detail-val">{formatValue(label, value)}</div>
    </>
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

// "examName" -> "Exam Name"
function humanize(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(key, value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "object") return JSON.stringify(value);

  const text = String(value);

  // 2026-11-03T10:32:00Z jaisi date-time
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return formatDateTime(text);

  return text;
}

function formatDateTime(value) {
  if (!value) return "-";

  // Backend UTC bhejta hai par "Z" nahi lagata, isliye khud laga do
  const text = String(value);
  const date = new Date(
    /[zZ]|[+-]\d{2}:\d{2}$/.test(text) ? text : `${text}Z`
  );

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

  const text = String(value);
  const date = new Date(
    /[zZ]|[+-]\d{2}:\d{2}$/.test(text) ? text : `${text}Z`
  );

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);

  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default AdminBackup;
