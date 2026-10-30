import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  Clock,
  Trophy,
  CircleCheck,
  Trash2,
  CreditCard,
} from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  notifyNotificationsChanged,
} from "../services/notificationService";

import "./Notifications.css";

// type -> icon, rang, aur click par kaunsa page khulega
const TYPE_META = {
  "form-deadline": {
    icon: ClipboardList,
    tone: "amber",
    label: "Exam Form",
    page: "examForms",
  },
  "form-week": {
    icon: ClipboardList,
    tone: "amber",
    label: "Exam Form",
    page: "examForms",
  },
  "form-eve": {
    icon: ClipboardList,
    tone: "violet",
    label: "Exam Form",
    page: "examForms",
  },
  "form-last": {
    icon: ClipboardList,
    tone: "red",
    label: "Last Date",
    page: "examForms",
  },
  // purani notifications (pehle ke test) ke liye
  "form-4d": {
    icon: ClipboardList,
    tone: "amber",
    label: "Exam Form",
    page: "examForms",
  },
  "form-deadline": {
    icon: ClipboardList,
    tone: "amber",
    label: "Exam Form",
    page: "examForms",
  },
  "exam-week": {
    icon: CalendarDays,
    tone: "blue",
    label: "Exam",
    page: "exams",
  },
  "exam-eve": {
    icon: Clock,
    tone: "violet",
    label: "Exam",
    page: "exams",
  },
  "exam-day": {
    icon: GraduationCap,
    tone: "red",
    label: "Exam Day",
    page: "exams",
  },
  result: {
    icon: Trophy,
    tone: "green",
    label: "Result",
    page: "results",
  },
  // Subscription: plan chalu / khatam hone wala hai / khatam ho gaya
  "sub-start": {
    icon: CreditCard,
    tone: "green",
    label: "Subscription",
    page: "subscription",
  },
  "sub-eve": {
    icon: CreditCard,
    tone: "amber",
    label: "Subscription",
    page: "subscription",
  },
  "sub-end": {
    icon: CreditCard,
    tone: "red",
    label: "Subscription",
    page: "subscription",
  },
};

const DEFAULT_META = {
  icon: Bell,
  tone: "blue",
  label: "Notification",
  page: null,
};

function Notifications({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all | unread
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");

      const data = await getNotifications({
        unreadOnly: filter === "unread",
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function openItem(item) {
    const meta = TYPE_META[item.type] || DEFAULT_META;

    if (!item.isRead) {
      // Pehle screen par read dikhao, phir server ko batao
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, isRead: true } : x))
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationRead(item.id);
        notifyNotificationsChanged();
      } catch (err) {
        setError(err.message || "Unable to update the notification.");
        load();
        return;
      }
    }

    if (meta.page && onNavigate) onNavigate(meta.page);
  }

  async function handleMarkAll() {
    try {
      setBusy(true);
      setError("");

      await markAllNotificationsRead();

      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
      notifyNotificationsChanged();
    } catch (err) {
      setError(err.message || "Unable to mark notifications as read.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    try {
      setError("");

      await deleteNotification(item.id);

      setItems((prev) => prev.filter((x) => x.id !== item.id));

      if (!item.isRead) setUnreadCount((count) => Math.max(0, count - 1));

      notifyNotificationsChanged();
    } catch (err) {
      setError(err.message || "Unable to delete the notification.");
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Delete all your notifications?")) return;

    try {
      setBusy(true);
      setError("");

      await clearAllNotifications();

      setItems([]);
      setUnreadCount(0);
      notifyNotificationsChanged();
    } catch (err) {
      setError(err.message || "Unable to clear notifications.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nt-page">
      <div className="nt-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Reminders for your exam form last dates, exam dates and results.
          </p>
        </div>

        <div className="nt-header-actions">
          <button
            type="button"
            className="nt-btn"
            onClick={handleMarkAll}
            disabled={busy || unreadCount === 0}
          >
            <CircleCheck size={16} />
            Mark all as read
          </button>

          <button
            type="button"
            className="nt-btn nt-btn-danger"
            onClick={handleClearAll}
            disabled={busy || items.length === 0}
          >
            <Trash2 size={16} />
            Clear all
          </button>
        </div>
      </div>

      <div className="nt-tabs">
        <button
          type="button"
          className={`nt-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={`nt-tab ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread
          {unreadCount > 0 && (
            <span className="nt-tab-count">{unreadCount}</span>
          )}
        </button>
      </div>

      {error && <div className="nt-alert">{error}</div>}

      <div className="nt-card">
        {loading ? (
          <div className="nt-empty">Loading...</div>
        ) : items.length === 0 ? (
          <div className="nt-empty">
            <span className="nt-empty-icon">
              <Bell size={26} />
            </span>

            <h3>
              {filter === "unread"
                ? "No unread notifications"
                : "You're all caught up"}
            </h3>

            <p>
              We will remind you before an exam form closes, before your exam
              and when your result is updated.
            </p>
          </div>
        ) : (
          <ul className="nt-list">
            {items.map((item) => {
              const meta = TYPE_META[item.type] || DEFAULT_META;
              const Icon = meta.icon;

              return (
                <li
                  key={item.id}
                  className={`nt-item ${item.isRead ? "" : "unread"}`}
                >
                  <button
                    type="button"
                    className="nt-item-main"
                    onClick={() => openItem(item)}
                  >
                    <span className={`nt-icon nt-tone-${meta.tone}`}>
                      <Icon size={19} />
                    </span>

                    <span className="nt-body">
                      <span className="nt-title-row">
                        <strong>{item.title}</strong>
                        {!item.isRead && <span className="nt-dot" />}
                      </span>

                      <span className="nt-message">{item.message}</span>

                      <span className="nt-meta">
                        <span className={`nt-tag nt-tone-${meta.tone}`}>
                          {meta.label}
                        </span>

                        <span title={formatDateTime(item.createdAt)}>
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="nt-delete"
                    onClick={() => handleDelete(item)}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function timeAgo(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 172800) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default Notifications;
