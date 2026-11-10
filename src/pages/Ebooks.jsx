import { useEffect, useState } from "react";
import {
  RefreshCw,
  BookOpen,
  FileText,
  Download,
  Lock,
  Eye,
} from "lucide-react";

import {
  getEbooks,
  getEbookUrl,
  getEbookDownloadUrl,
} from "../services/ebookService";

import "./Ebooks.css";

const CONFIG = {
  Free: {
    title: "Free Ebooks",
    description: "Read or download these ebooks for free.",
    emptyTitle: "No free ebooks right now",
    emptyText: "New free ebooks will appear here.",
  },
  Paid: {
    title: "Paid Ebooks",
    description: "Premium ebooks. Available with an active plan.",
    emptyTitle: "No paid ebooks right now",
    emptyText: "New paid ebooks will appear here.",
  },
};

function formatSize(bytes) {
  const size = Number(bytes) || 0;
  if (size <= 0) return "-";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// access: "Free" | "Paid"
function Ebooks({ access = "Free", onNavigate }) {
  const current = CONFIG[access] || CONFIG.Free;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState(null);

  // Free <-> Paid page badalne ya Refresh dabane par data dobara aata hai
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setItems([]);
        const data = await getEbooks({ access });
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load ebooks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [access, reload]);

  const hasLocked = items.some((item) => item.locked);

  function goToSubscription() {
    if (onNavigate) onNavigate("subscription");
  }

  async function handleRead(item) {
    const tab = window.open("", "_blank");
    try {
      setBusyId(item.id);
      const url = await getEbookUrl(item.id);
      if (!url) throw new Error("File link not found.");
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
    } catch (err) {
      if (tab) tab.close();
      window.alert(err.message || "Could not open the ebook.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(item) {
    try {
      setBusyId(item.id);
      const url = await getEbookDownloadUrl(item.id);
      if (!url) throw new Error("Download link not found.");
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.alert(err.message || "Could not download the ebook.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={() => setReload((n) => n + 1)} disabled={loading}>
            <RefreshCw size={17} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {hasLocked && (
        <div className="eb-banner">
          <span>Paid ebooks open only with an active plan. Subscribe to read and download them.</span>
          <button type="button" className="eb-btn" onClick={goToSubscription}>View plans</button>
        </div>
      )}

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={24} /></div>
            <h3>{current.emptyTitle}</h3>
            <p>{current.emptyText}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Ebook</th><th>Size</th><th>Added</th><th className="actions-column">Action</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="eb-name">
                        <FileText size={18} />
                        <div>
                          <div>{item.title}</div>
                          {item.description && <div className="eb-desc">{item.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{formatSize(item.sizeBytes)}</td>
                    <td>{formatDay(item.createdAt)}</td>
                    <td>
                      {item.locked ? (
                        <button type="button" className="eb-btn locked" onClick={goToSubscription}><Lock size={14} /> Subscribe to read</button>
                      ) : (
                        <div className="eb-actions">
                          <button type="button" className="eb-btn" onClick={() => handleRead(item)} disabled={busyId === item.id}><Eye size={14} /> Read</button>
                          <button type="button" className="eb-btn ghost" onClick={() => handleDownload(item)} disabled={busyId === item.id}><Download size={14} /> Download</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ebooks;