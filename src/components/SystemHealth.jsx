import { Server, Database } from "lucide-react";

// Chhota area chart (SVG). values = history, max = fixed top (e.g. 100 for %).
function Sparkline({ values = [], max, color, gradientId }) {
  const width = 200;
  const height = 64;

  const data =
    values.length > 1
      ? values
      : values.length === 1
        ? [values[0], values[0]]
        : [];

  if (data.length === 0) {
    return <div className="adm-spark-empty">Collecting data...</div>;
  }

  const top = max || Math.max(10, ...data) * 1.25;
  const step = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = (index * step).toFixed(1);
      const y = (height - Math.min(value / top, 1) * height).toFixed(1);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="adm-spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function formatUptime(totalSeconds) {
  if (totalSeconds === undefined || totalSeconds === null) return "-";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
}

function StatusPill({ ok, okText, badText }) {
  return (
    <span
      className={`adm-pill ${ok ? "adm-pill-green" : "adm-pill-red"}`}
    >
      <i className={`adm-live-dot ${ok ? "" : "off"}`} />

      {ok ? okText : badText}
    </span>
  );
}

// Web Service: Live / Uptime / CPU / Memory
export function WebServiceCard({ metrics, error }) {
  const web = metrics?.web;
  const live = Boolean(web) && !error;

  return (
    <section className="adm-card adm-col-card adm-health">
      <div className="adm-card-head">
        <div className="adm-head-title">
          <span className="adm-head-icon adm-tone-blue">
            <Server size={16} />
          </span>

          <div>
            <h2>Web Service</h2>

            <p>Examo API server</p>
          </div>
        </div>

        <StatusPill ok={live} okText="Live" badText="Unreachable" />
      </div>

      <div className="adm-health-meta">
        <span>Uptime</span>

        <strong>{formatUptime(web?.uptimeSeconds)}</strong>
      </div>

      <div className="adm-health-grid">
        <div className="adm-health-box">
          <div className="adm-health-label">CPU Usage</div>

          <div className="adm-health-value">
            {web ? `${web.cpuPercent}%` : "-"}
          </div>

          <Sparkline
            values={web?.cpuHistory}
            max={100}
            color="#2563eb"
            gradientId="adm-grad-cpu"
          />
        </div>

        <div className="adm-health-box">
          <div className="adm-health-label">Memory Usage</div>

          <div className="adm-health-value">
            {web ? `${web.memoryPercent}%` : "-"}

            {web && (
              <small>{web.memoryMb} MB</small>
            )}
          </div>

          <Sparkline
            values={web?.memoryHistory}
            max={100}
            color="#7c3aed"
            gradientId="adm-grad-mem"
          />
        </div>
      </div>
    </section>
  );
}

// Database: Connected / Active connections / Query response time
export function DatabaseCard({ metrics, error }) {
  const db = metrics?.database;
  const connected = Boolean(db?.connected) && !error;

  const active = db?.activeConnections;
  const max = db?.maxConnections;

  const percent =
    active != null && max
      ? Math.min(100, Math.round((active / max) * 100))
      : 0;

  return (
    <section className="adm-card adm-col-card adm-health">
      <div className="adm-card-head">
        <div className="adm-head-title">
          <span className="adm-head-icon adm-tone-teal">
            <Database size={16} />
          </span>

          <div>
            <h2>Database</h2>

            <p>PostgreSQL (Neon)</p>
          </div>
        </div>

        <StatusPill
          ok={connected}
          okText="Connected"
          badText={error ? "Unreachable" : "Disconnected"}
        />
      </div>

      <div className="adm-health-meta">
        <span>Response time</span>

        <strong>
          {db?.latencyMs != null ? `${db.latencyMs} ms` : "-"}
        </strong>
      </div>

      <div className="adm-health-grid">
        <div className="adm-health-box">
          <div className="adm-health-label">Active Connections</div>

          <div className="adm-gauge-row">
            <div className="adm-gauge">
              <svg viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#edf0f6"
                  strokeWidth="9"
                />

                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    (percent / 100) * 201
                  } 201`}
                  transform="rotate(-90 40 40)"
                />
              </svg>

              <strong>{active != null ? active : "-"}</strong>
            </div>

            <span className="adm-gauge-max">
              / {max != null ? max : "-"}
            </span>
          </div>
        </div>

        <div className="adm-health-box">
          <div className="adm-health-label">Query Performance (ms)</div>

          <div className="adm-health-value">
            {db?.latencyMs != null ? db.latencyMs : "-"}
          </div>

          <Sparkline
            values={db?.latencyHistory}
            color="#0d9488"
            gradientId="adm-grad-db"
          />
        </div>
      </div>
    </section>
  );
}
