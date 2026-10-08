import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { getActivityLogs } from "../services/adminService";

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown ke liye known actions
  const [knownActions, setKnownActions] = useState([]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  async function loadLogs(searchValue = search) {
    try {
      setLoading(true);
      setError("");

      const response = await getActivityLogs({
        action,
        search: searchValue.trim(),
      });

      const data = Array.isArray(response) ? response : [];

      setLogs(data);

      setKnownActions((previous) =>
        Array.from(
          new Set([...previous, ...data.map((log) => log.action)])
        ).sort()
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Logs load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadLogs();
  }

  return (
    <div>
      <div className="adm-heading">
        <div>
          <h1>Logs & Security</h1>
        </div>

        <button
          type="button"
          className="adm-btn"
          onClick={() => loadLogs()}
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

      <form className="adm-filters" onSubmit={handleSearchSubmit}>
        <div className="adm-field grow">
          <label>Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email ya details..."
          />
        </div>

        <div className="adm-field">
          <label>Action</label>

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">All actions</option>

            {knownActions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="primary-button">
          Search
        </button>

        <span className="adm-count">
          {logs.length} record{logs.length === 1 ? "" : "s"}
        </span>
      </form>

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>No logs found</h3>

            <p>Activity yahan dikhegi.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>

                    <td>
                      <strong>{log.userName || "-"}</strong>

                      {log.userEmail && (
                        <div className="adm-sub">
                          {log.userEmail}
                        </div>
                      )}
                    </td>

                    <td>
                      {log.role ? (
                        <span
                          className={`adm-pill ${
                            log.role === "Admin"
                              ? "adm-pill-violet"
                              : "adm-pill-blue"
                          }`}
                        >
                          {log.role}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <span
                        className={`adm-pill ${getActionPill(log)}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td>{log.details || "-"}</td>

                    <td>{log.ipAddress || "-"}</td>

                    <td>
                      <span
                        className={`adm-pill ${
                          log.success
                            ? "adm-pill-green"
                            : "adm-pill-red"
                        }`}
                      >
                        {log.success ? "Success" : "Failed"}
                      </span>
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

function getActionPill(log) {
  const action = (log.action || "").toLowerCase();

  if (!log.success || action.includes("failed")) {
    return "adm-pill-red";
  }

  if (action.includes("login")) return "adm-pill-green";
  if (action.includes("delete")) return "adm-pill-red";
  if (action.includes("password")) return "adm-pill-amber";
  if (action.includes("register")) return "adm-pill-violet";

  return "adm-pill-blue";
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
    second: "2-digit",
  });
}

export default AdminLogs;
