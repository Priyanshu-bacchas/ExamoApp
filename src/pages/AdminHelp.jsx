import { useEffect, useState } from "react";
import {
  RefreshCw,
  MessageSquare,
  Mail,
  CircleCheck,
  Clock,
  Trash2,
} from "lucide-react";

import {
  getSupportMessages,
  updateSupportMessageStatus,
  deleteSupportMessage,
} from "../services/adminService";

import "./AdminHelp.css";

const emptyStats = {
  total: 0,
  open: 0,
  resolved: 0,
  last7Days: 0,
};

function AdminHelp() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(emptyStats);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function loadMessages(searchValue = search) {
    try {
      setLoading(true);
      setError("");

      const data = await getSupportMessages({
        status,
        search: searchValue.trim(),
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
      setStats({ ...emptyStats, ...(data?.stats || {}) });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadMessages();
  }

  async function changeStatus(item, newStatus) {
    try {
      setBusyId(item.id);
      setError("");

      await updateSupportMessageStatus(item.id, newStatus);
      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to update the message.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("Delete this message permanently?")) return;

    try {
      setBusyId(item.id);
      setError("");

      await deleteSupportMessage(item.id);

      if (expandedId === item.id) setExpandedId(null);

      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to delete the message.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="adm-heading">
        <div>
          <h1>Help & Support</h1>
          <p>Messages sent by students from the Contact Us form.</p>
        </div>

        <button
          type="button"
          className="adm-btn"
          onClick={() => loadMessages()}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "adm-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-stats adm-help-stats">
        <StatCard
          tone="blue"
          icon={<MessageSquare size={20} />}
          title="Total Messages"
          value={stats.total}
          text="All time"
        />

        <StatCard
          tone="amber"
          icon={<Mail size={20} />}
          title="Open"
          value={stats.open}
          text="Waiting for a reply"
        />

        <StatCard
          tone="green"
          icon={<CircleCheck size={20} />}
          title="Resolved"
          value={stats.resolved}
          text="Completed"
        />

        <StatCard
          tone="violet"
          icon={<Clock size={20} />}
          title="Last 7 Days"
          value={stats.last7Days}
          text="New messages"
        />
      </div>

      <form className="adm-filters" onSubmit={handleSearchSubmit}>
        <div className="adm-field grow">
          <label>Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, subject or message..."
          />
        </div>

        <div className="adm-field">
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <button type="submit" className="primary-button">
          Search
        </button>

        <span className="adm-count">
          {items.length} message{items.length === 1 ? "" : "s"}
        </span>
      </form>

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No messages found</h3>

            <p>Student queries will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const open = expandedId === item.id;
                  const busy = busyId === item.id;
                  const resolved = item.status === "Resolved";

                  return [
                    <tr
                      key={item.id}
                      className="adm-help-row"
                      onClick={() =>
                        setExpandedId(open ? null : item.id)
                      }
                    >
                      <td>{formatDateTime(item.createdAt)}</td>

                      <td>
                        <strong>{item.name}</strong>

                        <div className="adm-sub">{item.email}</div>
                      </td>

                      <td>
                        <div className="adm-help-subject">
                          {item.subject}
                        </div>

                        {!open && (
                          <span className="adm-help-preview">
                            {item.message}
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`adm-pill ${
                            resolved
                              ? "adm-pill-green"
                              : "adm-pill-amber"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>,

                    open && (
                      <tr
                        key={`${item.id}-detail`}
                        className="adm-help-detail"
                      >
                        <td colSpan={4}>
                          <div className="adm-help-detail-box">
                            <div className="adm-help-detail-meta">
                              <span>
                                Name: <strong>{item.name}</strong>
                              </span>

                              <span>
                                Email: <strong>{item.email}</strong>
                              </span>

                              {item.userId && (
                                <span>
                                  User ID:{" "}
                                  <strong>{item.userId}</strong>
                                </span>
                              )}

                              {item.resolvedAt && (
                                <span>
                                  Resolved:{" "}
                                  <strong>
                                    {formatDateTime(item.resolvedAt)}
                                  </strong>
                                </span>
                              )}
                            </div>

                            <div className="adm-help-message">
                              {item.message}
                            </div>

                            <div className="adm-help-actions">
                              <a
                                className="adm-btn"
                                href={`mailto:${item.email}?subject=${encodeURIComponent(
                                  `Re: ${item.subject}`
                                )}`}
                              >
                                <Mail size={15} />
                                Reply by email
                              </a>

                              <button
                                type="button"
                                className="adm-btn"
                                disabled={busy}
                                onClick={() =>
                                  changeStatus(
                                    item,
                                    resolved ? "Open" : "Resolved"
                                  )
                                }
                              >
                                {resolved ? (
                                  <RefreshCw size={15} />
                                ) : (
                                  <CircleCheck size={15} />
                                )}
                                {resolved
                                  ? "Reopen"
                                  : "Mark as resolved"}
                              </button>

                              <button
                                type="button"
                                className="adm-btn adm-btn-danger"
                                disabled={busy}
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ tone, icon, title, value, text }) {
  return (
    <div className="adm-stat">
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

export default AdminHelp;
