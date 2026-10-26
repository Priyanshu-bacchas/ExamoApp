import { useEffect, useState } from "react";
import {
  RefreshCw,
  Briefcase,
  FileText,
  Trophy,
  Plus,
  Check,
} from "lucide-react";

import { getJobPosts, addJobToMyList } from "../services/jobService";

import "./Jobs.css";

const TABS = [
  {
    key: "Job",
    label: "Latest Jobs",
    icon: Briefcase,
    title: "Latest Jobs",
    description: "Latest job notifications. Apply before the last date.",
    emptyTitle: "No jobs right now",
    emptyText: "New job notifications will appear here.",
  },
  {
    key: "AdmitCard",
    label: "Admit Card",
    icon: FileText,
    title: "Admit Cards",
    description: "Download your admit cards as soon as they are out.",
    emptyTitle: "No admit cards right now",
    emptyText: "New admit cards will appear here.",
  },
  {
    key: "Result",
    label: "Results",
    icon: Trophy,
    title: "Results",
    description: "Check the latest exam results.",
    emptyTitle: "No results right now",
    emptyText: "New results will appear here.",
  },
];

// "2026-10-30" ko local date banata hai (timezone ka jhanjhat nahi)
function parseDay(value) {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDay(value) {
  const date = parseDay(value);

  if (!date) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Last date mein kitne din bache (aaj = 0)
function daysLeft(value) {
  const date = parseDay(value);

  if (!date) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((date - today) / 86400000);
}

// Sirf http / https link hi khulte hain
function safeUrl(value) {
  return value && /^https?:\/\//i.test(value) ? value : null;
}

function Jobs() {
  const [tab, setTab] = useState("Job");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const [notice, setNotice] = useState("");

  const current = TABS.find((x) => x.key === tab) || TABS[0];

  // Tab badalne ya Refresh dabane par data dobara aata hai
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setNotice("");
        setItems([]);

        const data = await getJobPosts(
          tab,
          tab === "Job" ? { activeOnly: true } : { take: 100 }
        );

        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);

        if (!cancelled) setError(err.message || "Unable to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tab, reload]);

  // Job ko user ke Exam Forms, Exams, Preparation aur Results me add karta hai
  async function handleAdd(item) {
    try {
      setAddingId(item.id);
      setError("");
      setNotice("");

      const data = await addJobToMyList(item.id);

      setAddedIds((ids) => [...ids, item.id]);
      setNotice(
        data?.message ||
          "Added to Exam Forms, Exams, Preparation and Results."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to add this job.");
    } finally {
      setAddingId(null);
    }
  }

  function renderJobsTable() {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Exam Name</th>
            <th>Start Date</th>
            <th>Last Date</th>
            <th>Exam Date</th>
            <th className="actions-column">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const left = daysLeft(item.lastDate);

            return (
              <tr key={item.id}>
                <td>
                  <strong className="jobs-name">{item.examName}</strong>
                </td>

                <td>{formatDay(item.startDate)}</td>

                <td>
                  {formatDay(item.lastDate)}

                  {left !== null && left >= 0 && left <= 3 && (
                    <span
                      className={`jobs-chip ${left === 0 ? "urgent" : ""}`}
                    >
                      {left === 0
                        ? "Last date today"
                        : left === 1
                        ? "1 day left"
                        : `${left} days left`}
                    </span>
                  )}
                </td>

                <td>{formatDay(item.examDate)}</td>

                <td>
                  {addedIds.includes(item.id) ? (
                    <button
                      type="button"
                      className="jobs-add-btn added"
                      disabled
                    >
                      <Check size={14} />
                      Added
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="jobs-add-btn"
                      onClick={() => handleAdd(item)}
                      disabled={addingId === item.id}
                    >
                      <Plus size={14} />
                      {addingId === item.id ? "Adding..." : "Add to ExamForm"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function renderPostsTable() {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Exam Name</th>
            <th>Date</th>
            <th>Status</th>
            <th className="actions-column">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const url = safeUrl(item.link);

            return (
              <tr key={item.id}>
                <td>
                  <strong className="jobs-name">{item.examName}</strong>
                </td>

                <td>{formatDay(item.postDate)}</td>

                <td>
                  <span
                    className={`status-badge ${
                      item.status === "Out"
                        ? "status-filled"
                        : "status-pending"
                    }`}
                  >
                    {item.status || "-"}
                  </span>
                </td>

                <td>
                  {url ? (
                    <a
                      className="jobs-open-btn"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  const EmptyIcon = current.icon;

  return (
    <div className="page">
      <div className="jobs-tabs">
        {TABS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              className={`jobs-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="page-header">
        <div>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setReload((n) => n + 1)}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {notice && <div className="jobs-notice">{notice}</div>}

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <EmptyIcon size={24} />
            </div>

            <h3>{current.emptyTitle}</h3>

            <p>{current.emptyText}</p>
          </div>
        ) : (
          <div className="table-container">
            {tab === "Job" ? renderJobsTable() : renderPostsTable()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
