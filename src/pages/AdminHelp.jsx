import { useEffect, useState } from "react";
import {
  RefreshCw,
  MessageSquare,
  Mail,
  CircleCheck,
  Clock,
  Trash2,
  Eye,
  Send,
} from "lucide-react";

import {
  getSupportMessages,
  updateSupportMessageStatus,
  deleteSupportMessage,
  replyToSupportMessage,
  markSupportMessageSeen,
} from "../services/supportService";

import { emitNotifyChanged } from "../services/adminNotifyService";

import "./AdminHelp.css";

// "New" badge ki styling (isi file me, alag CSS file ki zaroorat nahi)
const NEW_BADGE_CSS = `
.adm-help-newbadge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  vertical-align: middle;
}

/* Row par click se kuch nahi khulta, sirf Eye button se khulta hai */
.adm-help-row {
  cursor: default !important;
}

.adm-help-action-col {
  width: 110px;
  text-align: right;
  white-space: nowrap;
}

.adm-help-icons {
  display: inline-flex;
  gap: 8px;
}

.adm-help-icons button:disabled,
.adm-help-detail .delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Row ke halke rang: Open = amber, Resolved = green, Replied = blue */
.adm-help-row.row-open td {
  background: #ffeabd;
}

.adm-help-row.row-resolved td {
  background: #cdf3dc;
}

.adm-help-row.row-replied td {
  background: #cfe2ff;
}

.adm-help-row.row-open:hover td {
  background: #ffdf94;
}

.adm-help-row.row-resolved:hover td {
  background: #b5ebca;
}

.adm-help-row.row-replied:hover td {
  background: #b6d3ff;
}

.adm-help-row.row-open td:first-child {
  box-shadow: inset 4px 0 0 #f59e0b;
}

.adm-help-row.row-resolved td:first-child {
  box-shadow: inset 4px 0 0 #22c55e;
}

.adm-help-row.row-replied td:first-child {
  box-shadow: inset 4px 0 0 #3b82f6;
}

`;

// Message kholne par dikhne wale colorful box ki styling (isi file me)
const DETAIL_BOX_CSS = `
.adm-help-detail > td {
  padding: 0 !important;
  background: transparent !important;
  border-bottom: 1px solid var(--adm-line);
}

.hd-wrap {
  /* scroll hone par upar wala header / neeche ka kinara na dhake */
  scroll-margin: 90px 0 24px;
  padding: 16px 20px 20px;
  background: linear-gradient(180deg, #effaf9 0%, #f8fdfd 100%);
}

.hd-box {
  overflow: hidden;
  border: 1px solid #a7e3e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(8, 145, 178, 0.16);
}

.hd-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: linear-gradient(120deg, #0f766e 0%, #0891b2 100%);
  color: #ffffff;
}

.hd-avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 19px;
  font-weight: 800;
}

.hd-who {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.hd-who strong {
  font-size: 16px;
  color: #ffffff;
}

.hd-who span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-all;
}

.hd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hd-tag {
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}

.hd-tag-green {
  background: #22c55e;
  border-color: #16a34a;
}

.hd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 20px;
}

.hd-label {
  margin-bottom: 6px;
  color: #0f766e;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.hd-message {
  padding: 14px 16px;
  border: 1px solid #c4ecec;
  border-left: 5px solid #0891b2;
  border-radius: 12px;
  background: #ecfbfb;
  color: #1e293b;
  font-size: 14.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.hd-sent .hd-label {
  color: #15803d;
}

.hd-sent-body {
  padding: 14px 16px;
  border: 1px solid #c8efd6;
  border-left: 5px solid #16a34a;
  border-radius: 12px;
  background: #ecfdf3;
  color: #14532d;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.hd-reply {
  padding: 16px;
  border: 1px solid #fde1a8;
  border-left: 5px solid #f59e0b;
  border-radius: 12px;
  background: #fffaf0;
}

.hd-reply label.hd-label {
  display: block;
  color: #b45309;
}

.hd-reply textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #f3d9a0;
  border-radius: 10px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.hd-reply textarea:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

.hd-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 12px;
  color: #475569;
  font-size: 13px;
}

.hd-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.hd-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(16, 24, 40, 0.14);
  transition: transform 0.15s ease, filter 0.15s ease;
}

.hd-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.07);
}

.hd-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.hd-btn-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.hd-btn-green { background: linear-gradient(135deg, #22c55e, #16a34a); }
.hd-btn-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.hd-btn-red {
  background: linear-gradient(135deg, #f87171, #dc2626);
  padding: 0;
  width: 38px;
  justify-content: center;
}

.hd-btn-light {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  box-shadow: none;
}

@media (max-width: 700px) {
  .hd-wrap { padding: 12px; }
  .hd-head { padding: 14px; }
}
`;

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

  // Reply box
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [markResolved, setMarkResolved] = useState(true);
  const [notice, setNotice] = useState("");

  // Message / reply box khulne par screen ke hisaab se utna hi scroll karo
  // jisse poora box dikhe (neeche wali row ho to neeche, upar ho to upar).
  useEffect(() => {
    if (expandedId == null) return undefined;

    const timer = setTimeout(() => {
      const el = document.getElementById(`help-detail-${expandedId}`);

      if (!el) return;

      // Box screen se bada ho to uska upar wala hissa dikhao
      const tall = el.getBoundingClientRect().height > window.innerHeight * 0.85;

      el.scrollIntoView({
        behavior: "smooth",
        block: tall ? "start" : "nearest",
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [expandedId, replyId]);

  // Success notice kuch seconds baad hat jaye
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 5000);

    return () => clearTimeout(timer);
  }, [notice]);

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

  // Row kholte hi "New" hat jata hai (backend me bhi seen save hota hai)
  async function toggleRow(item, isOpen) {
    setExpandedId(isOpen ? null : item.id);

    if (isOpen || !item.isNew) return;

    setItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, isNew: false } : x))
    );

    try {
      await markSupportMessageSeen(item.id);

      // Sidebar ke NotifyMe badge ko refresh karo
      emitNotifyChanged();
    } catch (err) {
      console.error(err);
    }
  }

  function openReply(item) {
    setReplyId(replyId === item.id ? null : item.id);
    setReplyText("");
    setMarkResolved(true);
    setError("");
  }

  async function sendReply(item) {
    const text = replyText.trim();

    if (text.length < 2) {
      setError("Please write a reply first.");
      return;
    }

    try {
      setBusyId(item.id);
      setError("");
      setNotice("");

      await replyToSupportMessage(item.id, {
        reply: text,
        markResolved,
      });

      setNotice(`Reply sent to ${item.email}.`);
      setReplyId(null);
      setReplyText("");

      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to send the reply.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    if (
      !window.confirm(
        "Delete this message? It will be saved in Backup & Restore, and you can restore it from there."
      )
    ) {
      return;
    }

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
      <style>{NEW_BADGE_CSS}</style>
      <style>{DETAIL_BOX_CSS}</style>

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

      {notice && <div className="adm-notice">{notice}</div>}

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
                  <th className="adm-help-action-col">Actions</th>
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
                      className={`adm-help-row ${
                        item.isNew ? "is-new" : ""
                      } ${
                        item.adminReply
                          ? "row-replied"
                          : resolved
                            ? "row-resolved"
                            : "row-open"
                      }`}
                    >
                      <td>{formatDateTime(item.createdAt)}</td>

                      <td>
                        <strong>{item.name}</strong>

                        {item.isNew && (
                          <span className="adm-help-newbadge">New</span>
                        )}

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

                        {item.repliedAt && (
                          <span className="adm-pill adm-pill-blue adm-help-replied">
                            Replied
                          </span>
                        )}
                      </td>

                      <td
                        className="adm-help-action-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="adm-help-icons">
                          <button
                            type="button"
                            className="edit-button"
                            title={open ? "Hide message" : "View message"}
                            aria-label="View message"
                            onClick={() => toggleRow(item, open)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete message"
                            aria-label="Delete message"
                            disabled={busy}
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>,

                    open && (
                      <tr
                        key={`${item.id}-detail`}
                        className="adm-help-detail"
                      >
                        <td colSpan={5}>
                          <div
                            className="hd-wrap"
                            id={`help-detail-${item.id}`}
                          >
                            <div className="hd-box">
                              <div className="hd-head">
                                <div className="hd-avatar">
                                  {(item.name || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="hd-who">
                                  <strong>{item.name}</strong>

                                  <span>{item.email}</span>
                                </div>

                                <div className="hd-tags">
                                  {item.userId && (
                                    <span className="hd-tag">
                                      User ID: {item.userId}
                                    </span>
                                  )}

                                  <span className="hd-tag">
                                    Received{" "}
                                    {formatDateTime(item.createdAt)}
                                  </span>

                                  {item.resolvedAt && (
                                    <span className="hd-tag hd-tag-green">
                                      Resolved{" "}
                                      {formatDateTime(item.resolvedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="hd-body">
                                <div>
                                  <div className="hd-label">Message</div>

                                  <div className="hd-message">
                                    {item.message}
                                  </div>
                                </div>

                                {item.adminReply && (
                                  <div className="hd-sent">
                                    <div className="hd-label">
                                      Last reply
                                      {item.repliedBy
                                        ? ` by ${item.repliedBy}`
                                        : ""}
                                      {" · "}
                                      {formatDateTime(item.repliedAt)}
                                    </div>

                                    <div className="hd-sent-body">
                                      {item.adminReply}
                                    </div>
                                  </div>
                                )}

                                {replyId === item.id && (
                                  <div className="hd-reply">
                                    <label
                                      className="hd-label"
                                      htmlFor={`reply-${item.id}`}
                                    >
                                      Reply to {item.email}
                                    </label>

                                    <textarea
                                      id={`reply-${item.id}`}
                                      rows={6}
                                      maxLength={5000}
                                      placeholder="Write your reply. It will be emailed to the student."
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      disabled={busy}
                                    />

                                    <label className="hd-check">
                                      <input
                                        type="checkbox"
                                        checked={markResolved}
                                        onChange={(e) =>
                                          setMarkResolved(
                                            e.target.checked
                                          )
                                        }
                                        disabled={busy}
                                      />
                                      Mark as resolved after sending
                                    </label>

                                    <div className="hd-actions">
                                      <button
                                        type="button"
                                        className="hd-btn hd-btn-blue"
                                        disabled={busy}
                                        onClick={() => sendReply(item)}
                                      >
                                        <Send size={15} />
                                        {busy
                                          ? "Sending..."
                                          : "Send reply"}
                                      </button>

                                      <button
                                        type="button"
                                        className="hd-btn hd-btn-light"
                                        disabled={busy}
                                        onClick={() => setReplyId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="hd-actions">
                                  <button
                                    type="button"
                                    className="hd-btn hd-btn-blue"
                                    disabled={busy}
                                    onClick={() => openReply(item)}
                                  >
                                    <Mail size={15} />
                                    {item.adminReply
                                      ? "Reply again"
                                      : "Reply"}
                                  </button>

                                  <button
                                    type="button"
                                    className={`hd-btn ${
                                      resolved
                                        ? "hd-btn-amber"
                                        : "hd-btn-green"
                                    }`}
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
                                    className="hd-btn hd-btn-red"
                                    title="Delete message"
                                    aria-label="Delete message"
                                    disabled={busy}
                                    onClick={() => handleDelete(item)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
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